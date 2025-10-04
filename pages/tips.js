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
      supabase.from('tip_configs').select('*').eq('user_id', user.fid).then(({ data }) => setConfigs(data || []));
    }
  }, [user]);

  const handleSaveConfig = async () => {
    if (!user || !selectedPost || !amount || !limit || !Object.values(actions).some(v => v)) return alert("Fill all fields.");
    const newConfig = { user_id: user.fid, post_id: selectedPost, token, amount, limit, actions };
    const { data, error } = await supabase.from('tip_configs').insert(newConfig);
    if (!error) setConfigs([...configs, data[0]]);
    setAmount(""); setLimit(""); setActions({ like: false, repost: false, comment: false });
  };

  const removeConfig = async (id) => {
    if (window.confirm("Delete config?")) {
      const { error } = await supabase.from('tip_configs').delete().eq('id', id);
      if (!error) setConfigs(configs.filter(c => c.id !== id));
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
                      <p><b>Post:</b> {posts.find(p => p.id === cfg.post_id)?.posts[0].slice(0, 40)}...</p>
                      <p><b>Token:</b> {cfg.token} | <b>Amount:</b> {cfg.amount} | <b>Limit:</b> {cfg.limit}</p>
                      <p><b>Actions:</b> {Object.keys(cfg.actions).filter(k => cfg.actions[k]).join(", ")}</p>
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