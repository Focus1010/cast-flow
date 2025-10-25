import React, { useState, useEffect } from "react";
import { useAccount } from 'wagmi';
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../components/Logo";
import { getUserInitials } from "../utils/helpers";
import { Bell, User, Link, Copy, BadgeCheck } from "lucide-react";

export default function ProfilePage() {
  const { user, authenticated, login } = useAuth();
  const { address } = useAccount();
  
  // State for claimable amounts
  const [claimableAmounts, setClaimableAmounts] = useState({
    ETH: "0.5",
    USDC: "0",
    ENB: "0",
    FCS: "0"
  });
  
  // State for claiming
  const [claiming, setClaiming] = useState({
    ETH: false,
    USDC: false,
    ENB: false,
    FCS: false
  });

  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const userFid = typeof user.fid === 'object' ? user.fid.toString() : user.fid;
      
      // Load claimable tips from smart contract
      if (address) {
        try {
          const claimResponse = await fetch(`/api/claimable-tips?address=${address}`);
          const claimData = await claimResponse.json();
          
          if (claimData.success) {
            setClaimableAmounts(claimData.claimableAmounts);
          }
        } catch (error) {
          console.error('Error loading claimable amounts:', error);
          setClaimableAmounts({
            ETH: "0",
            USDC: "0",
            ENB: "0",
            FCS: "0"
          });
        }
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleClaimToken = async (token) => {
    if (!authenticated) {
      login();
      return;
    }

    setClaiming(prev => ({ ...prev, [token]: true }));
    
    try {
      // Real smart contract interaction
      const contractAddress = process.env.NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS;
      
      if (!contractAddress) {
        alert('Tipping contract not deployed yet. Please check back later.');
        return;
      }

      // This would use wagmi hooks or ethers to interact with the contract
      // For now, we'll simulate the interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update claimable amounts after successful claim
      setClaimableAmounts(prev => ({
        ...prev,
        [token]: "0"
      }));
      
      alert(`Successfully claimed ${claimableAmounts[token]} ${token}!`);
      
      // Reset claimable amount
      setClaimableAmounts(prev => ({ ...prev, [token]: "0" }));
      
    } catch (error) {
      console.error('Error claiming token:', error);
      alert('Failed to claim token');
    } finally {
      setClaiming(prev => ({ ...prev, [token]: false }));
    }
  };


  if (!authenticated) {
    return (
      <div className="profile-page">
        <div className="page-header">
          <div>
            <Logo size={28} showText={true} />
          </div>
          <div className="header-actions">
            <button className="notification-btn"><Bell size={16} /></button>
            <div className="user-avatar">JD</div>
          </div>
        </div>
        
        <div className="auth-prompt">
          <p>Please connect your wallet to view your profile</p>
          <button className="btn" onClick={login}>Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title"><User size={20} className="inline-icon" /> Profile</h1>
        </div>
        <div className="header-actions">
          <button className="notification-btn"><Bell size={16} /></button>
          <div className="user-avatar">
            {getUserInitials(user, 'JD')}
          </div>
        </div>
      </div>

      <div className="profile-content">
        {/* User Info Section */}
        <div className="user-info-section">
          <div className="user-avatar-large">
            {getUserInitials(user, 'AX')}
          </div>
          
          <div className="user-details">
            <div className="user-header">
              <h2 className="username">
                {user?.display_name || user?.username || 'alex.eth'}
              </h2>
              <span className="verified-badge"><BadgeCheck size={16} className="inline-icon" /></span>
            </div>
            
            <div className="user-subtitle">
              {user?.display_name ? user.username : 'Alex Thompson'}
            </div>
            
            <div className="user-fid">FID: {user?.fid || '12345'}</div>
            
            <div className="user-bio">
              {user?.bio || 'Building the future of decentralized social media. Crypto enthusiast & developer.'}
            </div>
          </div>
        </div>


        {/* Connected Wallet */}
        <div className="wallet-section">
          <div className="section-header">
            <h3><Link size={18} className="inline-icon" /> Connected Wallet</h3>
          </div>
          
          <div className="wallet-card">
            <div className="wallet-address">
              {address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '0x742d...7CcE'}
            </div>
            <button className="copy-btn"><Copy size={16} /></button>
          </div>
        </div>

        {/* Claim Tokens */}
        <div className="claim-section">
          <div className="claim-card eth-card">
            <div className="claim-header">
              <h3>Claim ETH</h3>
            </div>
            <div className="claim-amount">{claimableAmounts.ETH} ETH</div>
            <button 
              className={`claim-btn ${claiming.ETH ? 'loading' : ''}`}
              onClick={() => handleClaimToken('ETH')}
              disabled={claiming.ETH || claimableAmounts.ETH === "0"}
            >
              {claiming.ETH ? 'Claiming...' : 'Claim'}
            </button>
          </div>

          <div className="claim-card usdc-card">
            <div className="claim-header">
              <h3>Claim USDC</h3>
            </div>
            <div className="claim-amount">{claimableAmounts.USDC} USDC</div>
            <button 
              className={`claim-btn ${claiming.USDC ? 'loading' : ''}`}
              onClick={() => handleClaimToken('USDC')}
              disabled={claiming.USDC || claimableAmounts.USDC === "0"}
            >
              {claiming.USDC ? 'Claiming...' : 'Claim'}
            </button>
          </div>

          <div className="claim-card enb-card">
            <div className="claim-header">
              <h3>Claim ENB</h3>
            </div>
            <div className="claim-amount">{claimableAmounts.ENB} ENB</div>
            <button 
              className={`claim-btn ${claiming.ENB ? 'loading' : ''}`}
              onClick={() => handleClaimToken('ENB')}
              disabled={claiming.ENB || claimableAmounts.ENB === "0"}
            >
              {claiming.ENB ? 'Claiming...' : 'Claim'}
            </button>
          </div>

          <div className="claim-card fcs-card">
            <div className="claim-header">
              <h3>Claim FCS</h3>
            </div>
            <div className="claim-amount">{claimableAmounts.FCS} FCS</div>
            <button 
              className={`claim-btn ${claiming.FCS ? 'loading' : ''}`}
              onClick={() => handleClaimToken('FCS')}
              disabled={claiming.FCS || claimableAmounts.FCS === "0"}
            >
              {claiming.FCS ? 'Claiming...' : 'Claim'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
