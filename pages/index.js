import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useSendCalls } from 'wagmi';
import { encodeFunctionData, parseUnits } from 'viem';
import { sdk } from '@farcaster/miniapp-sdk';
import { supabase } from "../lib/supabase";
import contractABI from "../utils/contractABI.json"; // Get from Remix
import { useAuth } from "../contexts/AuthContext";
import ImageUpload from "../components/ImageUpload";

export default function SchedulerPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendCalls } = useSendCalls();
  const { user, authenticated, login } = useAuth();
  const [posts, setPosts] = useState([]);
  const [thread, setThread] = useState([{ id: Date.now(), content: "" }]);
  const [datetime, setDatetime] = useState("");
  const [packageInfo, setPackageInfo] = useState(null);
  const [limit, setLimit] = useState(10);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [monthlyUsed, setMonthlyUsed] = useState(0);
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [connectError, setConnectError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [schedulingStatus, setSchedulingStatus] = useState('');

  // Mini app init
  useEffect(() => {
    const initMiniApp = async () => {
      setIsLoading(true);
      try {
        await sdk.actions.ready(); // Hide splash screen in mini app
        const isMini = await sdk.isInMiniApp();
        setIsInMiniApp(isMini);
      } catch (error) {
        console.error("Mini app init error:", error);
        setConnectError("Failed to initialize mini app.");
      } finally {
        setIsLoading(false);
      }
    };
    initMiniApp();
  }, []);

  // Load data
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          // First try to find user by fid, if not found create new user
          let { data: u, error: uError } = await supabase.from('users').select('*').eq('fid', user.fid).single();
          
          if (uError && uError.code === 'PGRST116') {
            // User doesn't exist, create new user
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                fid: user.fid,
                username: user.username || '',
                bio: user.bio || '',
                wallet_address: user.wallet || '',
                monthly_used: 0,
                is_admin: false
              })
              .select()
              .single();
            
            if (createError) throw createError;
            u = newUser;
          } else if (uError) {
            throw uError;
          }
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
    
    // Validate scheduled time is in the future
    const scheduledTime = new Date(datetime);
    const now = new Date();
    if (scheduledTime <= now) {
      return alert("Scheduled time must be in the future.");
    }
    
    setSchedulingStatus("Scheduling post...");
    
    try {
      // Store in database first (we'll handle posting via cron job)
      const { data: newPost, error } = await supabase.from('scheduled_posts').insert({
        user_id: user.fid,
        posts: validPosts.map(p => p.content),
        datetime: scheduledTime.toISOString(),
        images: images.length > 0 ? images : null,
        status: 'scheduled'
      }).select().single();
      
      if (error) throw error;
      
      setSchedulingStatus("✅ Post scheduled successfully!");
      
      // Update UI
      setPosts([...posts, {
        ...newPost,
        _id: newPost.id
      }]);
      
      // Update monthly usage
      await supabase.from('users').update({ 
        monthly_used: monthlyUsed + 1 
      }).eq('fid', user.fid);
      
      setMonthlyUsed(monthlyUsed + 1);
      
      // Reset form
      setThread([{ id: Date.now(), content: "" }]);
      setDatetime("");
      setImages([]);
      
      // Clear status after 3 seconds
      setTimeout(() => setSchedulingStatus(""), 3000);
      
    } catch (error) {
      console.error("Scheduling error:", error);
      setSchedulingStatus("❌ Scheduling failed: " + error.message);
      setTimeout(() => setSchedulingStatus(""), 5000);
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

      {!authenticated ? (
        <button className="btn" onClick={login}>Connect Wallet</button>
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

          {/* Image Upload Component */}
          <div style={{ marginBottom: "16px" }}>
            <ImageUpload 
              onImagesChange={setImages}
              maxImages={4}
              userId={user?.fid}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="datetime" className="schedule-label">
              Schedule Time
            </label>
            <input
              id="datetime"
              type="datetime-local"
              className="datetime-input"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              disabled={!isUnlimited && monthlyUsed >= limit}
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <button
            className="btn"
            onClick={handleSchedule}
            disabled={schedulingStatus.includes("Scheduling")}
          >
            {schedulingStatus.includes("Scheduling") ? "Scheduling..." : "Schedule Post"}
          </button>

          {schedulingStatus && (
            <div style={{ 
              marginTop: "12px", 
              padding: "8px 12px", 
              borderRadius: "6px",
              backgroundColor: schedulingStatus.includes("✅") ? "rgba(34, 197, 94, 0.1)" : 
                             schedulingStatus.includes("❌") ? "rgba(239, 68, 68, 0.1)" : 
                             "rgba(124, 58, 237, 0.1)",
              color: schedulingStatus.includes("✅") ? "#16a34a" : 
                     schedulingStatus.includes("❌") ? "#dc2626" : "#7c3aed",
              fontSize: "14px",
              fontWeight: 500
            }}>
              {schedulingStatus}
            </div>
          )}

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
                    style={{ 
                      border: "1px solid #ccc", 
                      padding: "12px", 
                      borderRadius: "8px",
                      backgroundColor: entry.status === 'posted' ? 'rgba(34, 197, 94, 0.05)' :
                                     entry.status === 'failed' ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                    }}
                  >
                    <div>
                      {/* Status Badge */}
                      {entry.status && (
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          marginBottom: '8px',
                          backgroundColor: entry.status === 'posted' ? '#16a34a' :
                                         entry.status === 'failed' ? '#dc2626' :
                                         entry.status === 'scheduled' ? '#7c3aed' : '#6b7280',
                          color: 'white'
                        }}>
                          {entry.status === 'posted' ? '✅ Posted' :
                           entry.status === 'failed' ? '❌ Failed' :
                           entry.status === 'scheduled' ? '⏰ Scheduled' : 'Unknown'}
                        </span>
                      )}
                      
                      {/* Post Content */}
                      {entry.posts.map((text, i) => (
                        <p key={i} style={{ marginBottom: "6px" }}>
                          {text}
                        </p>
                      ))}
                      
                      {/* Images Preview */}
                      {entry.images && entry.images.length > 0 && (
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '8px',
                          marginBottom: '8px'
                        }}>
                          {entry.images.slice(0, 3).map((imageUrl, i) => (
                            <img
                              key={i}
                              src={imageUrl}
                              alt={`Attachment ${i + 1}`}
                              style={{
                                width: '60px',
                                height: '60px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                border: '1px solid #ddd'
                              }}
                            />
                          ))}
                          {entry.images.length > 3 && (
                            <div style={{
                              width: '60px',
                              height: '60px',
                              backgroundColor: '#f5f5f5',
                              borderRadius: '4px',
                              border: '1px solid #ddd',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              color: '#666'
                            }}>
                              +{entry.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <span className="small">
                        Scheduled for: {new Date(entry.datetime).toLocaleString()}
                        {entry.posted_at && (
                          <span style={{ marginLeft: '8px', color: '#16a34a' }}>
                            • Posted: {new Date(entry.posted_at).toLocaleString()}
                          </span>
                        )}
                      </span>
                      
                      {entry.error_message && (
                        <p style={{ 
                          color: '#dc2626', 
                          fontSize: '12px', 
                          marginTop: '4px',
                          fontStyle: 'italic'
                        }}>
                          Error: {entry.error_message}
                        </p>
                      )}
                    </div>
                    
                    {entry.status !== 'posted' && (
                      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                        <button
                          className="btn-ghost"
                          style={{ color: "red" }}
                          onClick={() => removePost(entry.id || entry._id)}
                        >
                          ✖ Remove
                        </button>
                        {entry.status === 'scheduled' && (
                          <button
                            className="btn-ghost"
                            style={{ color: "green" }}
                            onClick={() => handlePostNow(entry.id || entry._id)}
                          >
                            ✅ Post Now
                          </button>
                        )}
                      </div>
                    )}
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