import React, { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { supabase } from '../lib/supabase';
import { ethers } from 'ethers';
import { TIPPING_CONTRACT_ABI, ERC20_ABI, CONTRACT_ADDRESSES, CONTRACT_HELPERS } from '../utils/contractABI';

const contractAddress = process.env.CONTRACT_ADDRESS;

export default function ProfilePage() {
  const { user, authenticated, login } = useAuth();
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
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
    if (!user || !isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    setClaiming(prev => ({ ...prev, [tipData.token]: true }));
    
    try {
      console.log('🎯 Claiming tip:', tipData);
      
      let result;
      if (tipData.address === ethers.ZeroAddress) {
        // Claim ETH
        result = await writeContract({
          address: CONTRACT_ADDRESSES.TIPPING_CONTRACT,
          abi: TIPPING_CONTRACT_ABI,
          functionName: 'claimETH',
          args: [],
        });
      } else {
        // Claim token
        result = await writeContract({
          address: CONTRACT_ADDRESSES.TIPPING_CONTRACT,
          abi: TIPPING_CONTRACT_ABI,
          functionName: 'claimTokens',
          args: [tipData.address],
        });
      }
      
      console.log('✅ Claim transaction:', result);
      alert(`Successfully claimed ${tipData.formatted} ${tipData.symbol}! 🎉`);
      
      // Reload claimable tips
      await loadClaimableTips();
      
    } catch (error) {
      console.error('Error claiming tip:', error);
      alert('Failed to claim tip: ' + (error.message || error));
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
          <label className="small">
            Primary Wallet (For Transactions) 
            {user?.isConnected && <span style={{ color: '#16a34a', marginLeft: '8px' }}>✅ Connected</span>}
          </label>
          <input 
            className="input" 
            type="text" 
            value={user?.wallet || 'Not connected'} 
            readOnly 
            style={{ fontSize: "12px", fontFamily: "monospace" }}
          />
          {(!user?.wallet || user?.wallet === 'Not connected') && (
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              💡 Wallet will connect automatically when you make transactions
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
        
        {/* Individual Token Claim Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {/* ETH Claim Button */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '12px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', color: '#1f2937' }}>ETH</span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Ethereum</span>
            </div>
            <button
              className="btn"
              onClick={() => handleClaimTip({ 
                token: 'ETH', 
                symbol: 'ETH', 
                address: ethers.ZeroAddress,
                formatted: '0.00' // Will be updated when we load actual amounts
              })}
              disabled={claiming.ETH}
              style={{ 
                width: '100%',
                backgroundColor: claiming.ETH ? '#ccc' : '#3b82f6',
                color: 'white',
                fontSize: '12px',
                padding: '6px 12px'
              }}
            >
              {claiming.ETH ? "Claiming..." : "🎯 Claim ETH"}
            </button>
          </div>

          {/* USDC Claim Button */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '12px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', color: '#1f2937' }}>USDC</span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>USD Coin</span>
            </div>
            <button
              className="btn"
              onClick={() => handleClaimTip({ 
                token: 'USDC', 
                symbol: 'USDC', 
                address: CONTRACT_ADDRESSES.USDC,
                formatted: '0.00'
              })}
              disabled={claiming.USDC}
              style={{ 
                width: '100%',
                backgroundColor: claiming.USDC ? '#ccc' : '#10b981',
                color: 'white',
                fontSize: '12px',
                padding: '6px 12px'
              }}
            >
              {claiming.USDC ? "Claiming..." : "🎯 Claim USDC"}
            </button>
          </div>

          {/* ENB Claim Button */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '12px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', color: '#1f2937' }}>ENB</span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>ENB Token</span>
            </div>
            <button
              className="btn"
              onClick={() => handleClaimTip({ 
                token: 'ENB', 
                symbol: 'ENB', 
                address: CONTRACT_ADDRESSES.ENB || '0x0000000000000000000000000000000000000000',
                formatted: '0.00'
              })}
              disabled={claiming.ENB}
              style={{ 
                width: '100%',
                backgroundColor: claiming.ENB ? '#ccc' : '#f59e0b',
                color: 'white',
                fontSize: '12px',
                padding: '6px 12px'
              }}
            >
              {claiming.ENB ? "Claiming..." : "🎯 Claim ENB"}
            </button>
          </div>

          {/* Cast Flow Token Claim Button */}
          <div style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '12px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', color: '#1f2937' }}>FCS</span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Cast Flow</span>
            </div>
            <button
              className="btn"
              onClick={() => handleClaimTip({ 
                token: 'FCS', 
                symbol: 'FCS', 
                address: CONTRACT_ADDRESSES.CASTFLOW_TOKEN || '0x0000000000000000000000000000000000000000',
                formatted: '0.00'
              })}
              disabled={claiming.FCS}
              style={{ 
                width: '100%',
                backgroundColor: claiming.FCS ? '#ccc' : '#8b5cf6',
                color: 'white',
                fontSize: '12px',
                padding: '6px 12px'
              }}
            >
              {claiming.FCS ? "Claiming..." : "🎯 Claim FCS"}
            </button>
          </div>
        </div>

        {claimableTips.length > 0 && (
          <div>
            <h4 style={{ marginBottom: '8px', fontSize: '14px', color: '#6b7280' }}>Available Tips:</h4>
            <div className="token-grid">
              {claimableTips.map((tip) => (
                <div key={tip.token} className="token-block" style={{ 
                  padding: '8px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div className="token-info">
                    <span className="token-name" style={{ fontWeight: 'bold' }}>{tip.symbol}</span>
                    <span className="token-amount" style={{ fontSize: '12px', color: '#6b7280' }}>{tip.formatted} {tip.symbol}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}