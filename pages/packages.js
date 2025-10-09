import React, { useState, useEffect } from "react";
import { useAccount, useConnect, useWriteContract } from 'wagmi';
import { ethers } from 'ethers';
import { useAuth } from "../contexts/AuthContext";
import Logo from "../components/Logo";
import { parseUnits } from 'viem';
import { supabase } from '../lib/supabase';
import { TIPPING_CONTRACT_ABI, ERC20_ABI, CONTRACT_ADDRESSES } from '../utils/contractABI';

export default function PackagesPage() {
  const { user, authenticated, login } = useAuth();
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  
  // State for current usage
  const [currentUsage, setCurrentUsage] = useState({
    used: 8,
    total: 10,
    remaining: 2
  });
  
  // State for purchasing
  const [purchasing, setPurchasing] = useState(null);
  const [status, setStatus] = useState("");

  // Package tiers
  const packages = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      posts: 10,
      icon: '🆓',
      features: ['10 posts/month', 'Basic scheduling', 'Community support'],
      isCurrent: true,
      buttonText: 'Current Plan',
      buttonStyle: 'current'
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 5,
      posts: 15,
      icon: '🚀',
      features: ['15 posts/month', 'Advanced scheduling', 'Email support', 'Basic analytics'],
      isCurrent: false,
      buttonText: 'Upgrade',
      buttonStyle: 'upgrade'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 10,
      posts: 30,
      icon: '⭐',
      features: ['30 posts/month', 'Priority scheduling', 'Priority support', 'Advanced analytics', 'Custom branding'],
      isCurrent: false,
      buttonText: 'Upgrade',
      buttonStyle: 'upgrade',
      isPopular: true
    }
  ];

  // Load user's current package info
  useEffect(() => {
    if (user) {
      loadUserPackageInfo();
    }
  }, [user]);

  const loadUserPackageInfo = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('package_type, monthly_used, premium_expiry')
        .eq('fid', user.fid)
        .single();

      if (userData) {
        const packageLimits = {
          'free': 10,
          'starter': 15,
          'pro': 30,
          'elite': 60
        };

        const currentPlan = userData.package_type || 'free';
        const totalPosts = packageLimits[currentPlan] || 10;
        const usedPosts = userData.monthly_used || 0;

        setCurrentUsage({
          used: usedPosts,
          total: totalPosts,
          remaining: Math.max(0, totalPosts - usedPosts)
        });

        // Update package current status
        packages.forEach(pkg => {
          pkg.isCurrent = pkg.id === currentPlan;
          pkg.buttonText = pkg.isCurrent ? 'Current Plan' : 'Upgrade';
          pkg.buttonStyle = pkg.isCurrent ? 'current' : 'upgrade';
        });
      }
    } catch (error) {
      console.error('Error loading package info:', error);
    }
  };

  const handleUpgrade = async (pkg) => {
    if (!authenticated) {
      login();
      return;
    }

    if (pkg.isCurrent) {
      return; // Already on this plan
    }

    if (pkg.price === 0) {
      // Downgrade to free
      await updateUserPackage(pkg);
      return;
    }

    setPurchasing(pkg.id);
    setStatus("Processing upgrade...");

    try {
      if (!isConnected || !address) {
        throw new Error("Please connect your wallet first");
      }

      const priceInUSDC = parseUnits(pkg.price.toString(), 6);

      // Approve USDC spending
      setStatus("Approving USDC...");
      await writeContract({
        address: CONTRACT_ADDRESSES.USDC,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.TIPPING_CONTRACT, priceInUSDC],
      });

      // Purchase package
      setStatus("Purchasing package...");
      await writeContract({
        address: CONTRACT_ADDRESSES.TIPPING_CONTRACT,
        abi: TIPPING_CONTRACT_ABI,
        functionName: 'buyPackage',
        args: [pkg.name, priceInUSDC],
      });

      // Update database
      await updateUserPackage(pkg);
      
      setStatus(`✅ Successfully upgraded to ${pkg.name}!`);
      
    } catch (error) {
      console.error("Upgrade error:", error);
      setStatus("Upgrade failed: " + (error.reason || error.message));
    } finally {
      setPurchasing(null);
    }
  };

  const updateUserPackage = async (pkg) => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          fid: user.fid,
          package_type: pkg.id,
          premium_expiry: pkg.price > 0 ? Math.floor(Date.now() / 1000) + 30*24*3600 : null,
          wallet_address: address
        });

      if (error) throw error;
      
      // Reload package info
      await loadUserPackageInfo();
      
    } catch (error) {
      console.error("Database update error:", error);
    }
  };

  if (!authenticated) {
    return (
      <div className="packages-page">
        <div className="page-header">
          <div>
            <Logo size={28} showText={true} />
            <p className="page-subtitle">💎 Scale your Farcaster presence</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">🔔</button>
            <div className="user-avatar">JD</div>
          </div>
        </div>
        
        <div className="auth-prompt">
          <p>Please connect your wallet to view and upgrade plans</p>
          <button className="btn" onClick={login}>Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="packages-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">💎 Choose Your Plan</h1>
          <p className="page-subtitle">Scale your Farcaster presence</p>
        </div>
        <div className="header-actions">
          <button className="notification-btn">🔔</button>
          <div className="user-avatar">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'JD'}
          </div>
        </div>
      </div>

      <div className="packages-content">
        {/* Current Usage Banner */}
        <div className="usage-banner">
          <div className="usage-text">
            You've used {currentUsage.used}/{currentUsage.total} posts this month
          </div>
          <div className="usage-bar">
            <div 
              className="usage-progress" 
              style={{ width: `${(currentUsage.used / currentUsage.total) * 100}%` }}
            ></div>
          </div>
          <div className="usage-remaining">
            {currentUsage.remaining} posts remaining
          </div>
        </div>

        {/* Package Cards */}
        <div className="packages-grid">
          {packages.map((pkg) => (
            <div 
              key={pkg.id}
              className={`package-card ${pkg.isCurrent ? 'current' : ''} ${pkg.isPopular ? 'popular' : ''}`}
            >
              {pkg.isPopular && (
                <div className="popular-badge">MOST POPULAR</div>
              )}
              
              <div className="package-header">
                <div className="package-icon">{pkg.icon}</div>
                <div className="package-name">{pkg.name}</div>
                <div className="package-price">
                  {pkg.price === 0 ? (
                    <span className="price-free">$0</span>
                  ) : (
                    <span className="price-amount">${pkg.price}</span>
                  )}
                  <span className="price-period">
                    {pkg.price === 0 ? 'forever' : 'USDC/month'}
                  </span>
                </div>
              </div>

              <div className="package-posts">
                {pkg.posts} posts/month
              </div>

              <div className="package-features">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-check">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`package-btn ${pkg.buttonStyle} ${purchasing === pkg.id ? 'loading' : ''}`}
                onClick={() => handleUpgrade(pkg)}
                disabled={purchasing === pkg.id || pkg.isCurrent}
              >
                {purchasing === pkg.id ? 'Processing...' : pkg.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Status Message */}
        {status && (
          <div className="status-message">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
