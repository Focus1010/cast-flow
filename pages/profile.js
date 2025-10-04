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
      
      setLoading(true);
      setError('');
      
      try {
        // First try to find user by fid with better error handling
        let { data: u, error: uError } = await supabase
          .from('users')
          .select('*')
          .eq('fid', user.fid)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows

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
              premium_expiry: null,
              is_admin: false
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

        if (uError && uError.code !== 'PGRST116') {
          console.error('Supabase error:', uError);
        }

        // Set user data from either existing or newly created record
        const userData = u || {
          monthly_used: 0,
          premium_expiry: 0
        };
        
        setCastsUsed(userData.monthly_used || 0);
        setPremiumExpiry(userData.premium_expiry || 0);

        // Fetch tips from contract if wallet is connected
        if (window.ethereum && contractAddress && contractAddress !== 'undefined') {
          try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            // Fetch user's tip balances (implement based on your contract)
            const userAddress = await signer.getAddress();
            // Example: const tipBalance = await contract.getTipBalance(userAddress);
            // setTips({ ETH: tipBalance.eth, USDC: tipBalance.usdc, ... });
            
          } catch (contractError) {
            console.error('Contract interaction error:', contractError);
            // Don't set error for contract issues, just log them
          }
        }
        
      } catch (err) {
        console.error('Profile load error:', err);
        setError('Failed to load profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (authenticated && user) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user, authenticated]);

  const getContract = async () => {
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
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
      
      {/* User Info Section */}
      <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "rgba(124, 58, 237, 0.1)", borderRadius: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
          {user?.username && (
            <img 
              src={`https://res.cloudinary.com/merkle-manufactory/image/fetch/c_fill,f_png,w_144/${encodeURIComponent(`https://warpcast.com/~/channel-images/${user.username}.png`)}`}
              alt="Profile"
              style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" }}
              onError={(e) => {
                e.target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${user.fid}`;
              }}
            />
          )}
          <div>
            <h3 style={{ margin: 0, color: "#7c3aed" }}>@{user?.username || 'Anonymous'}</h3>
            <p style={{ margin: "4px 0", fontSize: "14px", opacity: 0.8 }}>FID: {user?.fid}</p>
            {user?.bio && <p style={{ margin: "4px 0", fontSize: "14px", fontStyle: "italic" }}>{user.bio}</p>}
          </div>
        </div>
        
        <div style={{ marginBottom: "12px" }}>
          <label className="small">Wallet Address</label>
          <input 
            className="input" 
            type="text" 
            value={user?.wallet || 'Not connected'} 
            readOnly 
            style={{ fontSize: "12px", fontFamily: "monospace" }}
          />
        </div>
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