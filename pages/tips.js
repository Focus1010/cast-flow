import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function TipsPage() {
  const { user, authenticated, login } = useAuth();
  
  // State for form
  const [selectedPost, setSelectedPost] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");
  const [tipAmount, setTipAmount] = useState("0.001");
  const [maxRecipients, setMaxRecipients] = useState(10);
  const [actions, setActions] = useState({
    likes: true,
    recast: false,
    comments: false
  });
  
  // State for data
  const [posts, setPosts] = useState([]);
  const [activeTips, setActiveTips] = useState([]);
  const [loading, setLoading] = useState(false);

  // Token options with current balances and USD values
  const tokens = [
    {
      symbol: "ETH",
      name: "Ethereum",
      balance: "0.025 ETH",
      usdValue: "$64.50",
      icon: "⟠"
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: "150.00 USDC",
      usdValue: "$150.00",
      icon: "💵"
    },
    {
      symbol: "FCS",
      name: "Farcaster Token",
      balance: "1,250 FCS",
      usdValue: "$125.00",
      icon: "🟣"
    },
    {
      symbol: "ENB",
      name: "ENB Token",
      balance: "500 ENB",
      usdValue: "$75.00",
      icon: "🔷"
    }
  ];

  // Calculate USD equivalent for tip amount
  const getUsdEquivalent = () => {
    const rate = selectedToken === "ETH" ? 2580 : 
                 selectedToken === "USDC" ? 1 :
                 selectedToken === "FCS" ? 0.1 : 0.15;
    
    return `$${(parseFloat(tipAmount) * rate).toFixed(2)}`;
  };

  // Calculate total budget
  const getTotalBudget = () => {
    const total = parseFloat(tipAmount) * maxRecipients;
    const usdTotal = parseFloat(getUsdEquivalent().replace('$', '')) * maxRecipients;
    return `${total.toFixed(3)} ${selectedToken} (~$${usdTotal.toFixed(2)})`;
  };

  // Mock scheduled posts
  useEffect(() => {
    if (user) {
      // Load real posts from database
      supabase.from('scheduled_posts').select('*').eq('user_id', user.fid).then(({ data }) => {
        setPosts(data || []);
      });
      
      // Load active tip configurations
      supabase.from('tip_pools').select('*').eq('creator_fid', user.fid.toString()).then(({ data }) => {
        setActiveTips(data || []);
      });
    } else {
      // Mock data for demo
      setPosts([
        { id: 1, posts: ["Just shipped a new feature for Cast Flow! The micro-tip..."] },
        { id: 2, posts: ["Building the future of decentralized social media. Crypto..."] },
        { id: 3, posts: ["GM Farcaster! Ready to schedule some amazing content..."] }
      ]);
    }
  }, [user]);

  const handleSaveTipConfig = async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!selectedPost) {
      alert("Please select a post to tip");
      return;
    }

    if (!Object.values(actions).some(v => v)) {
      alert("Please select at least one action to reward");
      return;
    }

    setLoading(true);
    try {
      const tipConfig = {
        post_id: parseInt(selectedPost),
        creator_fid: user.fid.toString(),
        token_address: getTokenAddress(selectedToken),
        token_symbol: selectedToken,
        amount_per_user: parseFloat(tipAmount),
        max_recipients: maxRecipients,
        interaction_types: actions
      };

      const { data, error } = await supabase.from('tip_pools').insert(tipConfig).select().single();
      
      if (error) throw error;

      setActiveTips([...activeTips, data]);
      alert('Tip configuration saved successfully!');
      
      // Reset form
      setSelectedPost("");
      setTipAmount("0.001");
      setMaxRecipients(10);
      setActions({ likes: true, recast: false, comments: false });
      
    } catch (error) {
      console.error('Error saving tip config:', error);
      alert('Failed to save tip configuration');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get token addresses
  const getTokenAddress = (symbol) => {
    const addresses = {
      'ETH': '0x0000000000000000000000000000000000000000',
      'USDC': process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      'ENB': process.env.NEXT_PUBLIC_ENB_ADDRESS || '0x0000000000000000000000000000000000000000',
      'FCS': process.env.NEXT_PUBLIC_CASTFLOW_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000'
    };
    return addresses[symbol] || '0x0000000000000000000000000000000000000000';
  };

  if (!authenticated) {
    return (
      <div className="tips-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">💰 Tips Configuration</h1>
            <p className="page-subtitle">Reward engagement on your posts</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">🔔</button>
            <div className="user-avatar">JD</div>
          </div>
        </div>
        
        <div className="auth-prompt">
          <p>Please connect your wallet to configure micro-tips</p>
          <button className="btn" onClick={login}>Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tips-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Tips Configuration</h1>
          <p className="page-subtitle">Reward engagement on your posts</p>
        </div>
        <div className="header-actions">
          <button className="notification-btn">🔔</button>
          <div className="user-avatar">JD</div>
        </div>
      </div>

      <div className="tips-content">
        {/* Choose Post Section */}
        <div className="tips-section">
          <div className="section-header">
            <h2>📝 Choose Post to Tip</h2>
          </div>
          
          <div className="post-selector">
            <select 
              className="post-select"
              value={selectedPost}
              onChange={(e) => setSelectedPost(e.target.value)}
            >
              <option value="">Select a scheduled post...</option>
              {posts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.posts?.[0]?.substring(0, 50) || 'Post content'}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Select Token Section */}
        <div className="tips-section">
          <div className="section-header">
            <h2>🪙 Select Token</h2>
          </div>
          
          <div className="token-selector">
            <select 
              className="token-select"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
            >
              {tokens.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.icon} {token.symbol} • {token.balance} • {token.usdValue}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount Settings Section */}
        <div className="tips-section">
          <div className="section-header">
            <h2>💵 Amount Settings</h2>
          </div>
          
          <div className="amount-settings">
            <div className="amount-input-group">
              <input
                type="number"
                className="amount-input"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                step="0.001"
                min="0.001"
              />
              <span className="amount-currency">{selectedToken}</span>
            </div>
            
            <div className="usd-equivalent">
              ≈ {getUsdEquivalent()} per tip
            </div>
            
            <div className="recipients-control">
              <label className="recipients-label">Max Recipients</label>
              <div className="recipients-input-group">
                <button 
                  className="recipients-btn"
                  onClick={() => setMaxRecipients(Math.max(1, maxRecipients - 1))}
                >
                  −
                </button>
                <span className="recipients-count">{maxRecipients}</span>
                <button 
                  className="recipients-btn"
                  onClick={() => setMaxRecipients(maxRecipients + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="total-budget">
              <span className="budget-label">Total Budget</span>
              <span className="budget-amount">{getTotalBudget()}</span>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="tips-section">
          <div className="section-header">
            <h2>💖 Actions</h2>
          </div>
          
          <div className="actions-grid">
            <button 
              className={`action-btn ${actions.likes ? 'active' : ''}`}
              onClick={() => setActions({...actions, likes: !actions.likes})}
            >
              <span className="action-icon">👍</span>
              <span className="action-label">Likes</span>
            </button>
            
            <button 
              className={`action-btn ${actions.recast ? 'active' : ''}`}
              onClick={() => setActions({...actions, recast: !actions.recast})}
            >
              <span className="action-icon">🔄</span>
              <span className="action-label">Recast</span>
            </button>
            
            <button 
              className={`action-btn ${actions.comments ? 'active' : ''}`}
              onClick={() => setActions({...actions, comments: !actions.comments})}
            >
              <span className="action-icon">💬</span>
              <span className="action-label">Comments</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button 
          className={`save-tips-btn ${loading ? 'loading' : ''}`}
          onClick={handleSaveTipConfig}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Tip Configuration'}
        </button>

        {/* Active Tips Section */}
        <div className="tips-section">
          <div className="section-header">
            <h2>📋 Active Tips</h2>
          </div>
          
          <div className="active-tips-list">
            {activeTips.length === 0 ? (
              <div className="empty-state">
                <p>Just shipped a new feature for Cast Flow! The micro-tip...</p>
                <div className="tip-status">
                  <span className="status-indicator"></span>
                  <span className="status-text">🔴 ⚠️</span>
                </div>
              </div>
            ) : (
              activeTips.map((tip) => (
                <div key={tip.id} className="active-tip-item">
                  <div className="tip-preview">
                    {posts.find(p => p.id === tip.post_id)?.posts?.[0]?.substring(0, 50) || 'Post content'}...
                  </div>
                  <div className="tip-status">
                    <span className="status-indicator active"></span>
                    <span className="status-text">Active</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
