import React, { useState, useEffect } from "react";
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useSendCalls } from 'wagmi';
import { encodeFunctionData, parseUnits } from 'viem';
import { supabase } from "../lib/supabase";
import contractABI from "../utils/contractABI.json"; // Get from Remix

export default function SchedulerPage() {
  const { login, logout, authenticated, user: privyUser, ready, error } = usePrivy(); // Privy for Farcaster auth
  const { address } = useAccount(); // Wagmi for wallet details
  const { sendCalls } = useSendCalls();
  const [user, setUser] = useState(null); // {fid, wallet, signer_uuid, is_admin, username, bio}
  const [posts, setPosts] = useState([]);
  const [thread, setThread] = useState([{ id: Date.now(), content: "" }]);
  const [datetime, setDatetime] = useState("");
  const [packageInfo, setPackageInfo] = useState(null);
  const [limit, setLimit] = useState(10);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [monthlyUsed, setMonthlyUsed] = useState(0);

  // Auto-load user from Privy (automatic if previously connected)
  useEffect(() => {
    if (ready && authenticated && privyUser) {
      const { farcaster } = privyUser;
      if (farcaster) {
        const newUser = {
          fid: farcaster.fid,
          wallet: address || farcaster.linkedAddresses[0] || '',
          signer_uuid: farcaster.signerUuid || '',
          is_admin: farcaster.fid === Number(process.env.NEXT_PUBLIC_ADMIN_FID),
          username: farcaster.username || '',
          bio: farcaster.bio || '',
        };
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        supabase.from('users').upsert(newUser).catch(console.error);
      }
    }
  }, [ready, authenticated, privyUser, address]);

  // Load data
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const { data: u, error: uError } = await supabase.from('users').select('*').eq('fid', user.fid).single();
          if (uError) throw uError;
          if (u) {
            const lastMonth = new Date(u.last_reset || 0).getMonth();
            const currentMonth = new Date().getMonth();
            if (lastMonth !== currentMonth) {
              const { error: updateError } = await supabase.from('users').update({ monthly_used: 0, last_reset: new Date().toISOString() }).eq('fid', user.fid);
              if (updateError) throw updateError;
              setMonthlyUsed(0);
            } else {
              setMonthlyUsed(u.monthly_used || 0);
            }
            setPackageInfo(u.package_type);
            setIsUnlimited(u.is_admin || u.package_type === "Unlimited");
            setLimit(u.is_admin ? Infinity : u.package_type === "Starter" ? 15 : u.package_type === "Pro" ? 30 : u.package_type === "Elite" ? 60 : 10);
          }
          const { data: p, error: pError } = await supabase.from('scheduled_posts').select('*').eq('user_id', user.fid);
          if (pError) throw pError;
          setPosts(p || []);
        } catch (error) {
          console.error("Data fetch error:", error);
          alert("Failed to load data: " + error.message);
        }
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
    if (!user) return alert("Connect Wallet first.");
    if (!datetime) return alert("Select date/time.");
    if (!isUnlimited && monthlyUsed >= limit) return alert(`Limit reached for ${packageInfo || "Free"}. Buy a package!`);
    const validPosts = thread.filter((p) => p.content.trim());
    if (validPosts.length === 0) return alert("Write something.");
    const timestamp = Math.floor(new Date(datetime).getTime() / 1000);
    try {
      const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
          'x-neynar-experimental': 'true'
        },
        body: JSON.stringify({
          signer_uuid: user.signer_uuid,
          text: validPosts.map(p => p.content).join('\n\n---\n\n'),
          scheduled_at: timestamp
        })
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      const castId = data.hash;
      const { error } = await supabase.from('scheduled_posts').insert({
        user_id: user.fid,
        posts: validPosts.map(p => p.content),
        datetime: new Date(datetime).toISOString(),
        cast_id: castId
      });
      if (error) throw error;
      // Example batch: Approve (USDC) and register (customize with real ABI/args)
      sendCalls({
        calls: [
          {
            to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
            data: encodeFunctionData({
              abi: [{
                "inputs": [
                  { "name": "spender", "type": "address" },
                  { "name": "amount", "type": "uint256" }
                ],
                "name": "approve",
                "outputs": [{ "name": "", "type": "bool" }],
                "stateMutability": "nonpayable",
                "type": "function"
              }], // ERC20 approve ABI
              functionName: 'approve',
              args: [process.env.CONTRACT_ADDRESS, parseUnits('1', 6)], // Approve 1 USDC
            })
          },
          {
            to: process.env.CONTRACT_ADDRESS,
            data: encodeFunctionData({
              abi: contractABI,
              functionName: 'registerScheduledPost',
              args: [castId, timestamp, address],
            })
          }
        ]
      });
      setPosts([...posts, { _id: Date.now(), posts: validPosts.map(p => p.content), datetime, cast_id: castId }]);
      await supabase.from('users').update({ monthly_used: monthlyUsed + 1 }).eq('fid', user.fid);
      setThread([{ id: Date.now(), content: "" }]);
      setDatetime("");
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
            'api_key': process.env.NEXNEYNAR_API_KEY,
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
        <button className="btn" onClick={() => connect({ connector: connectors[0] })}>Connect Wallet</button>
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
    </div>
  );
}