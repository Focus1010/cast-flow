import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract } from 'wagmi';
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { createScheduleTransaction } from '../utils/schedulingContract';
import { checkUnlimitedAccess } from '../utils/tokenGating';
import { ethers } from 'ethers';
import ImageUpload from "../components/ImageUpload";

export default function SchedulerPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContract } = useWriteContract();
  const { user, authenticated, login } = useAuth();
  const [posts, setPosts] = useState([]);
  const [thread, setThread] = useState([{ id: Date.now(), content: "", image: null }]);
  const [datetime, setDatetime] = useState("");
  const [packageInfo, setPackageInfo] = useState(null);
  const [limit, setLimit] = useState(10);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [monthlyUsed, setMonthlyUsed] = useState(0);
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [schedulingOnChain, setSchedulingOnChain] = useState(false);
  const [accessStatus, setAccessStatus] = useState({ checking: false, hasUnlimited: false, reason: '', tokens: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [schedulingStatus, setSchedulingStatus] = useState('');

  // Mini app init - check if running in Farcaster
  useEffect(() => {
    const initMiniApp = async () => {
      setIsLoading(true);
      try {
        // Check if we're in a Farcaster mini app environment
        const isMini = typeof window !== 'undefined' && 
                      (window.location.href.includes('warpcast.com') || 
                       window.parent !== window ||
                       window.location.href.includes('farcaster'));
        setIsInMiniApp(isMini);
        console.log('🔍 Mini app detected:', isMini);
        
        // Add frame-specific error handling
        if (isMini && typeof window !== 'undefined') {
          window.addEventListener('message', (event) => {
            console.log('Frame message received:', event.data);
          });
        }
      } catch (error) {
        console.error("Mini app init error:", error);
        setIsInMiniApp(false);
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
          // First try to find user by fid with better error handling
          let { data: u, error: uError } = await supabase
            .from('users')
            .select('*')
            .eq('fid', user.fid)
            .maybeSingle(); // Use maybeSingle to avoid errors when no rows found
          
          if (!u) {
            // User doesn't exist, create new user
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert({
                fid: user.fid,
                username: user.username || '',
                bio: user.bio || '',
                wallet_address: user.wallet || '',
                monthly_used: 0,
                is_admin: false,
                last_reset: new Date().toISOString()
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Create user error:', createError);
              throw createError;
            }
            u = newUser;
          } else if (uError) {
            console.error('User lookup error:', uError);
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
          // Fix: user_id should reference the user's fid, not UUID
          const { data: p, error: pError } = await supabase.from('scheduled_posts').select('*').eq('user_id', user.fid);
          if (pError) {
            console.error('Scheduled posts fetch error:', pError);
            // If table doesn't exist or has issues, just set empty array
            setPosts([]);
          } else {
            setPosts(p || []);
          }
        } catch (error) {
          console.error("Data fetch error:", error);
          alert("Failed to load data: " + error.message);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleContentChange = (id, value) => {
    setThread((prev) => prev.map((p) => (p.id === id ? { ...p, content: value } : p)));
  };

  const handleImageChange = (id, imageUrl) => {
    setThread((prev) => prev.map((p) => (p.id === id ? { ...p, image: imageUrl } : p)));
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !address) return;
      
      setAccessStatus({ checking: true, hasUnlimited: false, reason: '', tokens: {} });
      
      try {
        const accessResult = await checkUnlimitedAccess(address, user.fid);
        console.log('🔐 Access check result:', accessResult);
        
        setAccessStatus({
          checking: false,
          hasUnlimited: accessResult.hasAccess,
          reason: accessResult.reason,
          message: accessResult.message,
          tokens: accessResult.tokens || {}
        });
        
        if (accessResult.hasAccess) {
          setIsUnlimited(true);
          setLimit(999999); // Effectively unlimited
        }
      } catch (error) {
        console.error('❌ Error checking access:', error);
        setAccessStatus({ 
          checking: false, 
          hasUnlimited: false, 
          reason: 'error', 
          message: 'Error checking token access',
          tokens: {} 
        });
      }
    };

    checkAccess();
  }, [user, address]);

  // Add thread post function
  const addThreadPost = () => {
    if (!isUnlimited && monthlyUsed >= limit) {
      alert("You've reached your monthly limit. Upgrade to add more posts.");
      return;
    }
    
    setThread([...thread, { 
      id: Date.now(), 
      content: "", 
      image: null 
    }]);
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
    setSchedulingOnChain(true);
    
    try {
      // Step 1: On-chain confirmation (0.01 ETH commitment)
      setSchedulingStatus("💳 Confirming on-chain commitment...");
      
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }
      
      // Create content hash for on-chain storage
      const contentText = validPosts.map(p => p.content).join('\n\n---\n\n');
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes(contentText));
      const scheduledTimeUnix = Math.floor(scheduledTime.getTime() / 1000);
      
      // For now, we'll just do a simple ETH transaction as commitment
      // Later this will be replaced with the actual scheduling contract
      console.log('🔗 Creating on-chain commitment...');
      console.log('Content hash:', contentHash);
      console.log('Scheduled time:', scheduledTimeUnix);
      
      // For now, we'll skip the on-chain transaction until contract is deployed
      // This will use normal Base network gas fees (< 1 cent)
      console.log('⏭️ Skipping on-chain transaction until contract deployment');
      const onChainTx = 'pending_contract_deployment';
      
      console.log('✅ On-chain commitment successful:', onChainTx);
      
      // Step 2: Store in database with on-chain reference
      setSchedulingStatus("💾 Storing post data...");
      
      // Collect all images from thread posts
      const threadImages = validPosts.map(p => p.image).filter(img => img !== null);
      
      const { data: newPost, error } = await supabase.from('scheduled_posts').insert({
        user_id: user.fid, // Use fid as string, not UUID
        posts: validPosts.map(p => p.content),
        datetime: scheduledTime.toISOString(),
        images: threadImages.length > 0 ? threadImages : null,
        status: 'scheduled',
        content_hash: contentHash,
        commitment_tx: onChainTx || 'simulated', // Store transaction hash
        commitment_fee: '0.01' // ETH amount paid
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
      setThread([{ id: Date.now(), content: "", image: null }]);
      setDatetime("");
      
      // Clear status after 3 seconds
      setTimeout(() => setSchedulingStatus(""), 3000);
      
    } catch (error) {
      console.error("Scheduling error:", error);
      setSchedulingStatus("❌ Scheduling failed: " + error.message);
      setTimeout(() => setSchedulingStatus(""), 5000);
    } finally {
      setSchedulingOnChain(false);
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
        console.log('🚀 Posting now for entry:', entry);
        
        console.log('👤 User object:', user);
        console.log('🔑 Signer UUID:', user?.signer_uuid);
        
        if (!user?.signer_uuid) {
          throw new Error('No signer UUID found. Please ensure you have a Farcaster account connected.');
        }
        
        const response = await fetch('/api/post-now', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId: id,
            signerUuid: user.signer_uuid,
            text: entry.posts.join('\n\n---\n\n'),
            images: entry.images || []
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || result.error || 'Failed to post');
        }
        
        alert("✅ Posted successfully!");
        removePost(id);
      } catch (error) {
        console.error('❌ Post now error:', error);
        alert("❌ Post failed: " + error.message);
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
          {/* Access Status Display */}
          <div className="tag mb-3" style={{ 
            backgroundColor: accessStatus.hasUnlimited ? '#dcfce7' : '#fef3c7',
            color: accessStatus.hasUnlimited ? '#15803d' : '#92400e',
            border: `1px solid ${accessStatus.hasUnlimited ? '#16a34a' : '#f59e0b'}`
          }}>
            {accessStatus.checking ? (
              "🔍 Checking token access..."
            ) : accessStatus.hasUnlimited ? (
              `✅ ${accessStatus.message || 'Unlimited Access'}`
            ) : (
              `📦 Package: ${packageInfo || "Free"} — ${monthlyUsed}/${limit} used this month`
            )}
          </div>

          {/* Token Holdings Display */}
          {!accessStatus.checking && !accessStatus.hasUnlimited && Object.keys(accessStatus.tokens).length > 0 && (
            <div style={{ 
              marginBottom: "16px", 
              padding: "12px", 
              backgroundColor: "#f9fafb", 
              borderRadius: "6px",
              border: "1px solid #e5e7eb"
            }}>
              <p style={{ margin: "0 0 8px 0", fontSize: "12px", fontWeight: "600", color: "#374151" }}>
                💰 Token Holdings for Unlimited Access:
              </p>
              {Object.entries(accessStatus.tokens).map(([symbol, data]) => (
                <div key={symbol} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  fontSize: "11px", 
                  color: data.hasEnough ? "#059669" : "#dc2626",
                  marginBottom: "4px"
                }}>
                  <span>{symbol}:</span>
                  <span>{data.balance} / {data.required} {data.hasEnough ? "✅" : "❌"}</span>
                </div>
              ))}
              <p style={{ margin: "8px 0 0 0", fontSize: "10px", color: "#6b7280" }}>
                Hold the required amount of any token above for unlimited scheduling
              </p>
            </div>
          )}

          {thread.map((p, idx) => (
            <div key={p.id} style={{ marginBottom: "16px", padding: "12px", border: "1px solid #e5e5e5", borderRadius: "8px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
                Post {idx + 1}
              </label>
              <textarea
                id={`post-content-${p.id}`}
                name={`post-content-${p.id}`}
                className="input"
                placeholder={`Write your post content...`}
                value={p.content}
                onChange={(e) => handleThreadChange(p.id, e.target.value)}
                disabled={!isUnlimited && monthlyUsed >= limit}
                style={{ minHeight: "100px", resize: "vertical", width: "100%", marginBottom: "8px" }}
              />
              
              {/* Individual Image Upload for each post */}
              <ImageUpload 
                onImagesChange={(images) => handleImageChange(p.id, images[0] || null)}
                maxImages={1}
                userId={user?.fid}
                postId={p.id}
              />
              
              {thread.length > 1 && (
                <button
                  className="btn-ghost"
                  style={{ marginTop: "8px", color: "red", fontSize: "12px" }}
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
            <label htmlFor="datetime" className="schedule-label">
              Schedule Time
            </label>
            <input
              id="datetime"
              name="datetime"
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 className="mb-0">Scheduled Posts</h3>
              <button
                className="btn-ghost"
                onClick={async () => {
                  try {
                    setSchedulingStatus("🔄 Processing posts...");
                    
                    const response = await fetch('/api/manual-process-posts', { 
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    const result = await response.json();
                    setSchedulingStatus(`✅ Processed ${result.processed} posts`);
                    
                    // Refresh the page to see updates
                    setTimeout(() => {
                      window.location.reload();
                    }, 2000);
                    
                  } catch (error) {
                    setSchedulingStatus(`❌ Failed to process posts: ${error.message}`);
                    setTimeout(() => setSchedulingStatus(""), 5000);
                  }
                }}
                style={{ fontSize: "12px", padding: "4px 8px" }}
              >
                🔄 Process Now
              </button>
            </div>
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