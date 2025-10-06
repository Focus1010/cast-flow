import React, { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import { useAccount, useConnect, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { supabase } from '../lib/supabase';
import { TIPPING_CONTRACT_ABI, ERC20_ABI, CONTRACT_ADDRESSES } from '../utils/contractABI';

export default function PackagesPage() {
  const { user, authenticated, login } = useAuth();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { writeContract } = useWriteContract();
  const [status, setStatus] = useState("");
  const [packages, setPackages] = useState([
    { name: "Starter", price: 5, posts: 15 },
    { name: "Pro", price: 10, posts: 30 },
    { name: "Elite", price: 20, posts: 60 },
  ]);

  // USDC balance check temporarily disabled for testing
  // const { data: usdcBalance } = useReadContract({
  //   address: CONTRACT_ADDRESSES.USDC,
  //   abi: ERC20_ABI,
  //   functionName: 'balanceOf',
  //   args: [address],
  //   enabled: !!address,
  // });

  const handleBuy = async (pkg) => {
    if (!authenticated || !user) {
      return alert("Please connect your Farcaster account first.");
    }
    
    // Connect wallet if not connected
    if (!isConnected) {
      const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp');
      if (farcasterConnector) {
        try {
          await connect({ connector: farcasterConnector });
        } catch (error) {
          return alert("Failed to connect wallet. Please try again.");
        }
      } else {
        return alert("Farcaster wallet connector not found.");
      }
    }

    if (!address) {
      return alert("No wallet address found. Please connect your wallet.");
    }

    setStatus("Processing purchase...");
    
    try {
      console.log('✅ Connected wallet address:', address);
      console.log('🏗️ Contract addresses:', CONTRACT_ADDRESSES);
      
      if (!CONTRACT_ADDRESSES.TIPPING_CONTRACT) {
        throw new Error('Tipping contract address not configured. Please set NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS in environment variables.');
      }
      
      const priceInUSDC = parseUnits(pkg.price.toString(), 6); // USDC has 6 decimals
      
      // Balance check disabled for testing
      console.log('💰 Attempting to purchase package:', pkg.name, 'for', pkg.price, 'USDC');
      console.log('💳 Price in wei:', priceInUSDC.toString());
      
      setStatus("Approving USDC...");
      
      // First approve USDC spending
      const approveResult = await writeContract({
        address: CONTRACT_ADDRESSES.USDC,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.TIPPING_CONTRACT, priceInUSDC],
      });

      console.log('USDC approval transaction:', approveResult);
      setStatus("Purchasing package...");

      // Wait for approval transaction to be confirmed
      console.log('⏳ Waiting for USDC approval...');
      
      // Then purchase the package
      console.log('💳 Attempting package purchase...');
      const purchaseResult = await writeContract({
        address: CONTRACT_ADDRESSES.TIPPING_CONTRACT,
        abi: TIPPING_CONTRACT_ABI,
        functionName: 'buyPackage',
        args: [pkg.name, priceInUSDC],
      });
      
      console.log('📦 Package purchase transaction:', purchaseResult);
      
      // Update user data in Supabase
      const { error: dbError } = await supabase
        .from('users')
        .upsert({ 
          fid: user.fid,
          package_type: pkg.name, 
          premium_expiry: Math.floor(Date.now() / 1000) + 30*24*3600,
          wallet_address: address
        });
      
      if (dbError) console.error("Database update error:", dbError);
      
      setStatus(`✅ ${pkg.name} package purchased successfully!`);
    } catch (error) {
      console.error("Purchase error:", error);
      setStatus("Buy failed: " + (error.reason || error.message));
    }
  };

  return (
    <div className="card">
      <h2 className="mb-3">Buy Packages</h2>
      
      {!authenticated ? (
        <div>
          <p className="small mb-3">Please connect your wallet to purchase packages.</p>
          <button className="btn" onClick={login}>Connect Wallet</button>
        </div>
      ) : (
        <div>
          <div className="packages-grid">
            {packages.map((pkg) => (
              <div key={pkg.name} className="package-card">
                <div className="package-name">{pkg.name}</div>
                <div className="package-price">${pkg.price} USDC</div>
                <div className="package-posts">{pkg.posts} posts/month</div>
                <button className="btn" onClick={() => handleBuy(pkg)}>Buy</button>
              </div>
            ))}
          </div>
          {status && <p>{status}</p>}
        </div>
      )}
    </div>
  );
}