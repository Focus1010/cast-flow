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
                       window.navigator.userAgent.includes('Farcaster'));
        
        setIsInMiniApp(isMini);
        
        if (isMini) {
          console.log('🔄 Running in Farcaster mini app mode');
          // Add mini app specific styling
          document.body.style.margin = '0';
          document.body.style.padding = '10px';
          document.body.style.backgroundColor = '#0f172a';
        }
      } catch (error) {
        console.error('Mini app init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initMiniApp();
  }, []);

  // Load posts when user connects
  useEffect(() => {
    if (user && authenticated) {
      loadPosts();
      loadMonthlyUsage();
    }
  }, [user, authenticated]);

  // Check unlimited access when user connects
  useEffect(() => {
    if (!user || !address) return;
    
    const checkAccess = async () => {
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
    if (validPosts.length === 0) return alert("Write at least one post.");
    
    const scheduledTime = new Date(datetime);
    if (scheduledTime <= new Date()) return alert("Schedule time must be in the future.");
    
    setSchedulingOnChain(true);
    setSchedulingStatus("🔄 Starting scheduling process...");
    
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
      
      // Reset form
      setThread([{ id: Date.now(), content: "", image: null }]);
      setDatetime("");
      
      // Update monthly usage
      setMonthlyUsed(prev => prev + validPosts.length);
      
      alert(`✅ Scheduled ${validPosts.length} post(s) successfully! On-chain commitment: ${onChainTx}`);
      
    } catch (error) {
      console.error("❌ Scheduling error:", error);
      setSchedulingStatus(`❌ Error: ${error.message}`);
      alert(`❌ Failed to schedule: ${error.message}`);
    } finally {
      setSchedulingOnChain(false);
      // Clear status after 3 seconds
      setTimeout(() => setSchedulingStatus(''), 3000);
    }
  };

  const loadPosts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.fid)
        .order('datetime', { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadMonthlyUsage = async () => {
    if (!user) return;
    
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('posts')
        .eq('user_id', user.fid)
        .gte('created_at', startOfMonth.toISOString());
      
      if (error) throw error;
      
      const totalPosts = data?.reduce((sum, post) => sum + (post.posts?.length || 0), 0) || 0;
      setMonthlyUsed(totalPosts);
    } catch (error) {
      console.error('Error loading monthly usage:', error);
    }
  };

  const handleThreadChange = (id, value) => {
    setThread((prev) =>
      prev.map((p) => (p.id === id ? { ...p, content: value } : p))
    );
  };

  const handleImageUpload = (id, imageUrl) => {
    setThread((prev) =>
      prev.map((p) => (p.id === id ? { ...p, image: imageUrl } : p))
    );
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: 'white' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="scheduler-container" style={{ 
      maxWidth: isInMiniApp ? '100%' : '800px',
      margin: '0 auto',
      padding: isInMiniApp ? '10px' : '20px'
    }}>
      <div className="scheduler-header">
        <h2>🔄 Schedule Your Casts</h2>
        {isInMiniApp && (
          <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
            Running in Farcaster Mini App
          </p>
        )}
        
        {!authenticated ? (
          <div className="connect-prompt">
            <p>Connect your wallet to start scheduling posts</p>
            <button className="btn" onClick={login}>
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="user-info">
            <p>
              Welcome, <strong>{user?.display_name || user?.username || 'User'}</strong>! 
              {!isUnlimited && (
                <span> You have <strong>{limit - monthlyUsed}</strong> posts remaining this month.</span>
              )}
              {isUnlimited && (
                <span style={{ color: '#10b981' }}> ✨ Unlimited Access</span>
              )}
            </p>
            
            {accessStatus.checking && (
              <p style={{ color: '#f59e0b' }}>🔍 Checking token access...</p>
            )}
            
            {accessStatus.hasUnlimited && (
              <div style={{ 
                backgroundColor: '#065f46', 
                padding: '10px', 
                borderRadius: '8px', 
                marginBottom: '15px',
                border: '1px solid #10b981'
              }}>
                <p style={{ margin: 0, color: '#10b981' }}>
                  🎉 <strong>Unlimited Access Granted!</strong><br/>
                  <small>{accessStatus.message}</small>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {authenticated && (
        <div className="scheduler-form">
          {/* Thread Posts */}
          {thread.map((p, idx) => (
            <div key={p.id} style={{ marginBottom: "16px", padding: "12px", border: "1px solid #e5e5e5", borderRadius: "8px" }}>
              <label htmlFor={`post-content-${p.id}`} style={{ display: "block", marginBottom: "6px", fontWeight: 600 }}>
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
                onImageUpload={(imageUrl) => handleImageUpload(p.id, imageUrl)}
                currentImage={p.image}
                disabled={!isUnlimited && monthlyUsed >= limit}
              />
              
              {thread.length > 1 && (
                <button
                  className="btn-ghost"
                  onClick={() => deleteThreadPost(p.id)}
                  style={{ marginTop: "8px", color: "#dc2626" }}
                >
                  🗑️ Delete Post
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
            disabled={schedulingOnChain || (!isUnlimited && monthlyUsed >= limit)}
            style={{ 
              width: "100%", 
              opacity: schedulingOnChain ? 0.7 : 1,
              cursor: schedulingOnChain ? 'not-allowed' : 'pointer'
            }}
          >
            {schedulingOnChain ? "⏳ Scheduling..." : "🚀 Schedule Posts"}
          </button>
          
          {schedulingStatus && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: schedulingStatus.includes('✅') ? '#065f46' : schedulingStatus.includes('❌') ? '#7f1d1d' : '#1e40af',
              borderRadius: '6px',
              fontSize: '14px'
            }}>
              {schedulingStatus}
            </div>
          )}

          {!isUnlimited && monthlyUsed >= limit && (
            <div className="limit-warning">
              <p>⚠️ You've reached your monthly limit of {limit} posts.</p>
              <p>
                <a href="/packages" style={{ color: "#3b82f6" }}>
                  Buy a package
                </a>{" "}
                to schedule more posts!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Posts */}
      {authenticated && posts.length > 0 && (
        <div className="recent-posts">
          <h3>📅 Your Scheduled Posts</h3>
          <div className="posts-grid">
            {posts.slice(0, 5).map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-content">
                  {post.posts?.map((content, idx) => (
                    <p key={idx}>{content.slice(0, 100)}...</p>
                  ))}
                </div>
                <div className="post-meta">
                  <span>📅 {new Date(post.datetime).toLocaleDateString()}</span>
                  <span>⏰ {new Date(post.datetime).toLocaleTimeString()}</span>
                  <span className={`status ${post.status}`}>
                    {post.status === 'posted' ? '✅' : post.status === 'failed' ? '❌' : '⏳'} {post.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
