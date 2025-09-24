import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function TipsConfigPage() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [limit, setLimit] = useState("");
  const [actions, setActions] = useState({ like: false, repost: false, comment: false });
  const [configs, setConfigs] = useState([]);
  const [selectedPost, setSelectedPost] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data) setUser(data.user);
    };
    fetchUser();
  }, []);

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

      {!user ? (
        <div className="tag mb-3">⚠️ Sign in to configure tips.</div>
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
            <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
              Actions
            </label>
            <div className="kv">
              <label>
                <input type="checkbox" checked={actions.like} onChange={() => setActions({ ...actions, like: !actions.like })} /> Likes
              </label>
              <label>
                <input type="checkbox" checked={actions.repost} onChange={() => setActions({ ...actions, repost: !actions.repost })} /> Reposts
              </label>
              <label>
                <input type="checkbox" checked={actions.comment} onChange={() => setActions({ ...actions, comment: !actions.comment })} /> Comments
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