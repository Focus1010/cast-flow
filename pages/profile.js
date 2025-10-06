import React, { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ethers } from 'ethers';
import { TIPPING_CONTRACT_ABI, ERC20_ABI, CONTRACT_ADDRESSES, CONTRACT_HELPERS } from '../utils/contractABI';

const contractAddress = process.env.CONTRACT_ADDRESS;

export default function ProfilePage() {
  const { user, authenticated, login } = useAuth();
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

        // Load claimable tips from new contract
        await loadClaimableTips();
        
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

  const loadClaimableTips = async () => {
    try {
      if (!window.ethereum || !CONTRACT_ADDRESSES.TIPPING_CONTRACT) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.TIPPING_CONTRACT,
        TIPPING_CONTRACT_ABI,
        provider
      );

      const userAddress = await signer.getAddress();
      
      // Get supported tokens
      const supportedTokens = await contract.getSupportedTokens();
      
      // Load claimable balances for each token
      const tips = [];
      
      // ETH balance
      const ethBalance = await contract.getClaimableBalance(userAddress, ethers.ZeroAddress);
      if (ethBalance > 0) {
        tips.push({
          token: 'ETH',
          address: ethers.ZeroAddress,
          balance: ethBalance,
          symbol: 'ETH',
          formatted: CONTRACT_HELPERS.formatTokenAmount(ethBalance.toString(), 18)
        });
      }
      
      // Token balances
      for (const tokenAddress of supportedTokens) {
        const balance = await contract.getClaimableBalance(userAddress, tokenAddress);
        if (balance > 0) {
          const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const symbol = await tokenContract.symbol();
          const decimals = await tokenContract.decimals();
          
          tips.push({
            token: symbol,
            address: tokenAddress,
            balance: balance,
            symbol: symbol,
            formatted: CONTRACT_HELPERS.formatTokenAmount(balance.toString(), decimals)
          });
        }
      }
      
      setClaimableTips(tips);
      
    } catch (error) {
      console.error('Error loading claimable tips:', error);
    }
  };

  const handleClaimTip = async (tipData) => {
    if (!user) return;
    
    setClaiming(prev => ({ ...prev, [tipData.token]: true }));
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.TIPPING_CONTRACT,
        TIPPING_CONTRACT_ABI,
        signer
      );

      let tx;
      if (tipData.address === ethers.ZeroAddress) {
        // Claim ETH
        tx = await contract.claimETH();
      } else {
        // Claim token
        tx = await contract.claimTokens(tipData.address);
      }
      
      await tx.wait();
      
      alert(`Successfully claimed ${tipData.formatted} ${tipData.symbol}! 🎉`);
      
      // Reload claimable tips
      await loadClaimableTips();
      
    } catch (error) {
      console.error('Error claiming tip:', error);
      alert('Failed to claim tip: ' + error.message);
    } finally {
      setClaiming(prev => ({ ...prev, [tipData.token]: false }));
    }
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
          <img 
            src={user?.pfp_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.fid}`}
            alt="Profile"
            style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" }}
            onError={(e) => {
              e.target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.fid}`;
            }}
          />
          <div>
            <h3 style={{ margin: 0, color: "#7c3aed" }}>
              {user?.display_name || user?.username || 'Anonymous'}
            </h3>
            <p style={{ margin: "4px 0", fontSize: "14px", opacity: 0.8 }}>
              @{user?.username} • FID: {user?.fid}
            </p>
            {user?.follower_count !== undefined && (
              <p style={{ margin: "4px 0", fontSize: "12px", opacity: 0.7 }}>
                {user.follower_count} followers • {user.following_count} following
              </p>
            )}
            {user?.bio && <p style={{ margin: "4px 0", fontSize: "14px", fontStyle: "italic" }}>{user.bio}</p>}
          </div>
        </div>
        
        <div style={{ marginBottom: "12px" }}>
          <label className="small">Primary Wallet (For Transactions)</label>
          <input 
            className="input" 
            type="text" 
            value={user?.wallet || 'Not connected'} 
            readOnly 
            style={{ fontSize: "12px", fontFamily: "monospace" }}
          />
          {user?.custody_address && user?.custody_address !== user?.wallet && (
            <div style={{ marginTop: '8px' }}>
              <label className="small" style={{ opacity: 0.7 }}>Custody Address (Read-only)</label>
              <input 
                className="input" 
                type="text" 
                value={user.custody_address} 
                readOnly 
                style={{ fontSize: "12px", fontFamily: "monospace", opacity: 0.7 }}
              />
            </div>
          )}
          {(!user?.wallet || user?.wallet === 'Not connected') && (
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              💡 Connect a wallet to your Farcaster account to enable transactions
            </p>
          )}
        </div>
      </div>
      <div style={{ marginBottom: "16px" }}>
        <h3 className="mb-2">Usage</h3>
        <p>Casts Used: {castsUsed}</p>
        <p>Premium Active: {premiumExpiry > Date.now() / 1000 ? `Yes (expires ${new Date(premiumExpiry * 1000).toLocaleDateString()})` : "No"}</p>
      </div>
      <div style={{ marginBottom: "16px" }}>
        <h3 className="mb-2">💰 Claimable Tips</h3>
        {claimableTips.length === 0 ? (
          <p className="small">No tips to claim yet. Engage with posts that have tip pools!</p>
        ) : (
          <div className="token-grid">
            {claimableTips.map((tip) => (
              <div key={tip.token} className="token-block">
                <div className="token-info">
                  <span className="token-name">{tip.symbol}</span>
                  <span className="token-amount">{tip.formatted} {tip.symbol}</span>
                  <span className="token-claimable">Ready to claim</span>
                </div>
                <button
                  className="btn claim-btn"
                  onClick={() => handleClaimTip(tip)}
                  disabled={claiming[tip.token]}
                  style={{ 
                    backgroundColor: claiming[tip.token] ? '#ccc' : '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: claiming[tip.token] ? 'not-allowed' : 'pointer'
                  }}
                >
                  {claiming[tip.token] ? "Claiming..." : `🎯 Claim ${tip.symbol}`}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}