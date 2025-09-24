import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { supabase } from "../lib/supabase";
import contractABI from "../utils/contractABI.json"; // Get from Remix
import { QRCodeCanvas } from 'qrcode.react'; // Changed from default import to named import

export default function SchedulerPage() {
  const [user, setUser] = useState(null); // {fid, wallet, signer_uuid, is_admin}
  const [posts, setPosts] = useState([]);
  const [thread, setThread] = useState([{ id: Date.now(), content: "" }]);
  const [datetime, setDatetime] = useState("");
  const [packageInfo, setPackageInfo] = useState(null);
  const [limit, setLimit] = useState(10); // Free default
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [monthlyUsed, setMonthlyUsed] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [qrLink, setQrLink] = useState('');

  // Sign In with Farcaster (SIWF)
  const signInWithFarcaster = async () => {
    try {
      const nonceResponse = await fetch('https://api.neynar.com/v2/farcaster/signer', {
        method: 'POST',
        headers: { 'api_key': process.env.NEYNAR_API_KEY },
      });
      const { token, deepLink } = await nonceResponse.json();
      // Show QR instead of alert
      setQrLink(deepLink);
      setShowQR(true);
      let signed = false;
      while (!signed) {
        const statusRes = await fetch(`https://api.neynar.com/v2/farcaster/signer?token=${token}`, {
          headers: { 'api_key': process.env.NEYNAR_API_KEY },
        });
        const status = await statusRes.json();
        if (status.state === 'completed') {
          const { fid, signer_uuid } = status;
          const userRes = await fetch(`https://api.neynar.com/v1/farcaster/user?fid=${fid}`, {
            headers: { 'api_key': process.env.NEYNAR_API_KEY },
          });
          const userData = await userRes.json();
          const wallet = userData.result.user.verifiedAddresses[0] || ''; // Fallback if no verified address
          const { error } = await supabase.from('users').upsert({
            fid,
            wallet,
            signer_uuid,
            monthly_used: 0,
            package_type: null,
            premium_expiry: 0,
            is_admin: fid === Number(process.env.ADMIN_FID)
          });
          if (!error) {
            const newUser = { fid, wallet, signer_uuid, is_admin: fid === Number(process.env.ADMIN_FID) };
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
          }
          signed = true;
          setShowQR(false);
        }
        await new Promise(r => setTimeout(r, 5000));
      }
    } catch (error) {
      console.error("SIWF error:", error);
      alert("Sign in failed.");
      setShowQR(false);
    }
  };

  // Load data
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const { data: u } = await supabase.from('users').select('*').eq('fid', user.fid).single();
        if (u) {
          // Monthly reset check
          const lastMonth = new Date(u.last_reset || 0).getMonth();
          const currentMonth = new Date().getMonth();
          if (lastMonth !== currentMonth) {
            await supabase.from('users').update({ monthly_used: 0, last_reset: new Date().toISOString() }).eq('fid', user.fid);
            setMonthlyUsed(0);
          } else {
            setMonthlyUsed(u.monthly_used || 0);
          }
          setPackageInfo(u.package_type);
          setIsUnlimited(u.is_admin || u.package_type === "Unlimited");
          setLimit(u.is_admin ? Infinity : u.package_type === "Starter" ? 15 : u.package_type === "Pro" ? 30 : u.package_type === "Elite" ? 60 : 10);
        }
        const { data: p } = await supabase.from('scheduled_posts').select('*').eq('user_id', user.fid);
        setPosts(p || []);
      };
      fetchData();
    }
  }, [user]);

  const handleThreadChange = (id, value) => {
    setThread((prev) => prev.map((p) => (p.id === id ? { ...p, content: value } : p)));
  };

  const addThreadPost = () => {
    setThread([...thread, { id: Date.now(), content: "" }]);
  };

  const deleteThreadPost = (id) => {
    setThread((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSchedule = async () => {
  if (!user) return alert("Sign in first.");
  if (!datetime) return alert("Select date/time.");
  if (!isUnlimited && monthlyUsed >= limit) return alert(`Limit reached for ${packageInfo || "Free"}. Buy a package!`);
  const validPosts = thread.filter((p) => p.content.trim());
  if (validPosts.length === 0) return alert("Write something.");
  const timestamp = Math.floor(new Date(datetime).getTime() / 1000);

  try {
    const response = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signer_uuid: user.signer_uuid,
        text: validPosts.map(p => p.content).join('\n\n---\n\n'),
        scheduled_at: timestamp,
        user_fid: user.fid,
      }),
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    const castId = data.castId;

    setPosts([...posts, { _id: Date.now(), posts: validPosts.map(p => p.content), datetime, cast_id: castId }]);
    setThread([{ id: Date.now(), content: "" }]);
    setDatetime("");
    alert("Scheduled successfully!");
  } catch (error) {
    console.error(error);
    alert("Scheduling failed: " + error.message);
  }
};
  const removePost = async (id) => {
    if (window.confirm("Delete scheduled post?")) {
      const { error } = await supabase.from('scheduled_posts').delete().eq('id', id);
      if (!error) setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handlePostNow = async (id) => {
    const entry = posts.find(p => p.id === id);
    if (entry) {
      try {
        const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api_key': process.env.NEYNAR_API_KEY,
            'x-neynar-experimental': 'true'
          },
          body: JSON.stringify({
            signer_uuid: user.signer_uuid,
            text: entry.posts.join('\n\n---\n\n')
          })
        });
        if (!response.ok) throw new Error(await response.text());
        alert("Posted now!");
        removePost(id);
      } catch (error) {
        alert("Post failed: " + error.message);
      }
    }
  };

  return (
    <div className="card">
      <h2 className="mb-3">Post Scheduler</h2>

      {!user ? (
        <button className="btn" onClick={signInWithFarcaster}>Sign In with Farcaster</button>
      ) : (
        <>
          <div className="tag mb-3">
            {isUnlimited ? "Unlimited Scheduling" : `Package: ${packageInfo || "Free"} — ${monthlyUsed}/${limit} used this month`}
          </div>

          {thread.map((p, idx) => (
            <div key={p.id} style={{ marginBottom: "10px" }}>
              <textarea
                className="input"
                placeholder={`Post ${idx + 1}`}
                value={p.content}
                onChange={(e) => handleThreadChange(p.id, e.target.value)}
                disabled={!isUnlimited && monthlyUsed >= limit}
                style={{ minHeight: "100px", resize: "vertical", width: "100%" }}
              />
              {thread.length > 1 && (
                <button
                  className="btn-ghost"
                  style={{ marginTop: "4px", color: "red" }}
                  onClick={() => deleteThreadPost(p.id)}
                >
                  🗑 Delete Post {idx + 1}
                </button>
              )}
            </div>
          ))}

          <button
            className="btn-ghost"
            style={{ marginBottom: "10px" }}
            onClick={addThreadPost}
            disabled={!isUnlimited && monthlyUsed >= limit}
          >
            + Add Another Post
          </button>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="datetime" style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
              Schedule Time
            </label>
            <input
              id="datetime"
              type="datetime-local"
              className="datetime-input"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              disabled={!isUnlimited && monthlyUsed >= limit}
            />
          </div>

          <button
            className="btn"
            onClick={handleSchedule}
            disabled={!isUnlimited && monthlyUsed >= limit}
          >
            Schedule Post
          </button>

          <div style={{ marginTop: "20px" }}>
            <h3 className="mb-2">Scheduled Posts</h3>
            {posts.length === 0 ? (
              <p className="small">No scheduled posts yet.</p>
            ) : (
              <ul style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {posts.map((entry) => (
                  <li
                    key={entry.id || entry._id}
                    className="list-item"
                    style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "6px" }}
                  >
                    <div>
                      {entry.posts.map((text, i) => (
                        <p key={i} style={{ marginBottom: "6px" }}>
                          {text}
                        </p>
                      ))}
                      <span className="small">
                        Scheduled for: {new Date(entry.datetime).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <button
                        className="btn-ghost"
                        style={{ color: "red" }}
                        onClick={() => removePost(entry.id || entry._id)}
                      >
                        ✖ Remove
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ color: "green" }}
                        onClick={() => handlePostNow(entry.id || entry._id)}
                      >
                        ✅ Post Now
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
      {showQR && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '20px', zIndex: 1000 }}>
          <QRCodeCanvas value={qrLink} />
          <p>Scan with Warpcast app</p>
          <button onClick={() => setShowQR(false)}>Close</button>
        </div>
      )}
    </div>
  );
}