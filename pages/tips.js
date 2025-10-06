import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function TipsPage() {
  const { user, authenticated, login } = useAuth();
  const [token, setToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [limit, setLimit] = useState("");
  const [selectedPost, setSelectedPost] = useState("");
  const [actions, setActions] = useState({ like: false, repost: false, comment: false });
  const [configs, setConfigs] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (user) {
      supabase.from('scheduled_posts').select('*').eq('user_id', user.fid).then(({ data }) => setPosts(data || []));
      supabase.from('tip_pools').select('*').eq('creator_fid', user.fid.toString()).then(({ data }) => setConfigs(data || []));
    }
  }, [user]);

  const handleSaveConfig = async () => {
    if (!user || !selectedPost || !amount || !limit || !Object.values(actions).some(v => v)) {
      return alert("Please fill all fields and select at least one action.");
    }

    try {
      // Use the new tip_pools table structure
      const newConfig = { 
        post_id: parseInt(selectedPost),
        creator_fid: user.fid.toString(),
        token_address: getTokenAddress(token),
        token_symbol: token,
        amount_per_user: parseFloat(amount),
        max_recipients: parseInt(limit),
        interaction_types: actions
      };

      const { data, error } = await supabase.from('tip_pools').insert(newConfig).select().single();
      
      if (error) {
        console.error('Error saving tip config:', error);
        alert('Failed to save tip configuration: ' + error.message);
        return;
      }

      setConfigs([...configs, data]);
      setAmount(""); 
      setLimit(""); 
      setActions({ like: false, repost: false, comment: false });
      setSelectedPost("");
      alert("✅ Tip configuration saved successfully!");
      
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save configuration: ' + error.message);
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

  const removeConfig = async (id) => {
    if (window.confirm("Delete tip pool configuration?")) {
      const { error } = await supabase.from('tip_pools').delete().eq('id', id);
      if (!error) {
        setConfigs(configs.filter(c => c.id !== id));
        alert("✅ Tip pool configuration deleted!");
      } else {
        alert("❌ Failed to delete configuration: " + error.message);
      }
    }
  };

  return (
    <div className="card">
      <h2 className="mb-3">Tips Configuration</h2>

      {!authenticated ? (
        <div>
          <div className="tag mb-3">⚠️ Sign in to configure tips.</div>
          <button className="btn" onClick={login}>Connect Wallet</button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
              Choose Post
            </label>
            <select className="input" value={selectedPost} onChange={(e) => setSelectedPost(e.target.value)}>
              <option value="">-- Select --</option>
              {posts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.posts[0].slice(0, 40)}... ({new Date(p.datetime).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
              Token
            </label>
            <select className="input" value={token} onChange={(e) => setToken(e.target.value)}>
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="FCS">FCS</option>
              <option value="ENB">ENB</option>
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
              Amount per User
            </label>
            <input type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 100" />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
              Max Recipients
            </label>
            <input type="number" className="input" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="e.g. 100" />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: 12, fontWeight: 600 }}>
              Actions (Select which actions trigger tips)
            </label>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr 1fr", 
              gap: "16px",
              padding: "16px",
              backgroundColor: "rgba(124, 58, 237, 0.1)",
              borderRadius: "8px"
            }}>
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                cursor: "pointer",
                padding: "12px",
                backgroundColor: actions.like ? "rgba(124, 58, 237, 0.2)" : "transparent",
                borderRadius: "6px",
                border: actions.like ? "2px solid #7c3aed" : "2px solid transparent",
                transition: "all 0.2s ease"
              }}>
                <input 
                  type="checkbox" 
                  checked={actions.like} 
                  onChange={() => setActions({ ...actions, like: !actions.like })}
                  style={{ 
                    width: "20px", 
                    height: "20px", 
                    accentColor: "#7c3aed" 
                  }}
                />
                <span style={{ fontWeight: 500 }}>❤️ Likes</span>
              </label>
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                cursor: "pointer",
                padding: "12px",
                backgroundColor: actions.repost ? "rgba(124, 58, 237, 0.2)" : "transparent",
                borderRadius: "6px",
                border: actions.repost ? "2px solid #7c3aed" : "2px solid transparent",
                transition: "all 0.2s ease"
              }}>
                <input 
                  type="checkbox" 
                  checked={actions.repost} 
                  onChange={() => setActions({ ...actions, repost: !actions.repost })}
                  style={{ 
                    width: "20px", 
                    height: "20px", 
                    accentColor: "#7c3aed" 
                  }}
                />
                <span style={{ fontWeight: 500 }}>🔄 Reposts</span>
              </label>
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                cursor: "pointer",
                padding: "12px",
                backgroundColor: actions.comment ? "rgba(124, 58, 237, 0.2)" : "transparent",
                borderRadius: "6px",
                border: actions.comment ? "2px solid #7c3aed" : "2px solid transparent",
                transition: "all 0.2s ease"
              }}>
                <input 
                  type="checkbox" 
                  checked={actions.comment} 
                  onChange={() => setActions({ ...actions, comment: !actions.comment })}
                  style={{ 
                    width: "20px", 
                    height: "20px", 
                    accentColor: "#7c3aed" 
                  }}
                />
                <span style={{ fontWeight: 500 }}>💬 Comments</span>
              </label>
            </div>
          </div>

          <button className="btn" onClick={handleSaveConfig}>Save</button>

          <div style={{ marginTop: "24px" }}>
            <h3>Saved Configurations</h3>
            {configs.length === 0 ? (
              <p className="small">No configs yet.</p>
            ) : (
              <ul style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                {configs.map((cfg) => (
                  <li key={cfg.id} className="list-item">
                    <div>
                      <p><b>Post:</b> {posts.find(p => p.id === cfg.post_id)?.posts[0]?.slice(0, 40) || 'Post not found'}...</p>
                      <p><b>Token:</b> {cfg.token_symbol} | <b>Amount per User:</b> {cfg.amount_per_user} | <b>Max Recipients:</b> {cfg.max_recipients}</p>
                      <p><b>Actions:</b> {Object.keys(cfg.interaction_types || {}).filter(k => cfg.interaction_types[k]).join(", ") || 'None'}</p>
                      <p style={{ fontSize: "12px", color: "#6b7280" }}>
                        <b>Created:</b> {new Date(cfg.created_at).toLocaleDateString()} | 
                        <b> Expires:</b> {new Date(cfg.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="btn-ghost" style={{ color: "red" }} onClick={() => removeConfig(cfg.id)}>
                      🗑 Delete
                    </button>
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