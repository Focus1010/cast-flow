import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { supabase } from "../lib/supabase";
import contractABI from "../utils/contractABI.json";
import { useAuth } from "../contexts/AuthContext";

const contractAddress = process.env.CONTRACT_ADDRESS;

export default function ProfilePage() {
  const { user, authenticated, login } = useAuth();
  const [tips, setTips] = useState({ ETH: 0, USDC: 0, ENB: 0, FCS: 0 });
  const [claimableTips, setClaimableTips] = useState([]);
  const [claiming, setClaiming] = useState({ ETH: false, USDC: false, ENB: false, FCS: false });
  const [castsUsed, setCastsUsed] = useState(0);
  const [premiumExpiry, setPremiumExpiry] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setError('No user data. Sign in first.');
        return;
      }
      
      try {

        // Fetch from Supabase
        const { data: u, error: uError } = await supabase
          .from('users')
          .select('*')
          .eq('fid', user.fid)
          .single();
        if (uError) throw uError;

        if (u) {
          setCastsUsed(u.monthly_used || 0);
          setPremiumExpiry(u.premium_expiry || 0);
        }

        // Fetch tips from contract (simplified; add error handling)
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          // Fetch tips logic (your existing code, with try-catch)
          // ... (add your tip fetching here)
        } else {
          setError('Connect wallet for full profile.');
        }
      } catch (err) {
        setError('Failed to load profile: ' + err.message);
      }
    };
    
    if (authenticated && user) {
      loadUserData();
    }
  }, [user, authenticated]);

  const getContract = () => {
    if (!window.ethereum) return null;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
  };

  // handleClaim (your existing code, with error handling)
  const handleClaim = async (tokenName) => {
    // ... existing
  };

  if (loading) return <div className="card">Loading profile...</div>;
  
  if (!authenticated) {
    return (
      <div className="card">
        <h2 className="mb-3">Profile</h2>
        <p className="small mb-3">Please connect your wallet to view your profile.</p>
        <button className="btn" onClick={login}>Connect Wallet</button>
      </div>
    );
  }
  
  if (error) return <div className="card"><p className="small">{error}</p></div>;

  return (
    <div className="card">
      <h2 className="mb-3">Profile</h2>
      <div style={{ marginBottom: "16px" }}>
        <label className="small">Farcaster ID (FID)</label>
        <input className="input" type="text" value={user?.fid || ''} readOnly />
      </div>
      <div style={{ marginBottom: "16px" }}>
        <label className="small">Wallet Address</label>
        <input className="input" type="text" value={user?.wallet || ''} readOnly />
      </div>
      <div style={{ marginBottom: "16px" }}>
        <h3 className="mb-2">Usage</h3>
        <p>Casts Used: {castsUsed}</p>
        <p>Premium Active: {premiumExpiry > Date.now() / 1000 ? `Yes (expires ${new Date(premiumExpiry * 1000).toLocaleDateString()})` : "No"}</p>
      </div>
      <div style={{ marginBottom: "16px" }}>
        <h3 className="mb-2">Tips Received</h3>
        <div className="token-grid">
          {Object.keys(tips).map((token) => (
            <div key={token} className="token-block">
              <div className="token-info">
                <span className="token-name">{token}</span>
                <span className="token-amount">{tips[token]} {token}</span>
                <span className="token-claimable">Claimable: {claimableTips.filter(t => t.token === token).reduce((sum, t) => sum + t.amount, 0).toFixed(4)} {token}</span>
              </div>
              <button
                className="btn claim-btn"
                onClick={() => handleClaim(token)}
                disabled={claiming[token] || claimableTips.filter(t => t.token === token).length === 0}
              >
                {claiming[token] ? "Claiming..." : `Claim ${token}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}