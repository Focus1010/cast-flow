import React, { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { supabase } from '../lib/supabase';
import { TIPPING_CONTRACT_ABI, ERC20_ABI, CONTRACT_ADDRESSES } from '../utils/contractABI';

export default function PackagesPage() {
  const { user, authenticated, login } = useAuth();
  const { wallets } = useWallets();
  const [status, setStatus] = useState("");
  const [packages, setPackages] = useState([
    { name: "Starter", price: 5, posts: 15 },
    { name: "Pro", price: 10, posts: 30 },
    { name: "Elite", price: 20, posts: 60 },
  ]);

  const handleBuy = async (pkg) => {
    if (!authenticated || !user) {
      return alert("Please connect your Farcaster account first.");
    }
    
    // Get Privy embedded wallet
    const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
    if (!embeddedWallet) {
      return alert("Embedded wallet not found. Please try refreshing the app.");
    }

    setStatus("Connecting to wallet...");
    
    try {
      // Connect to Privy embedded wallet
      await embeddedWallet.connect();
      
      // Get provider from Privy wallet
      const provider = await embeddedWallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      
      console.log('✅ Connected to Privy embedded wallet');
      console.log('Wallet address:', await signer.getAddress());
      
      // Use the new tipping contract
      const contractAddress = CONTRACT_ADDRESSES.TIPPING_CONTRACT;
      const usdcAddress = CONTRACT_ADDRESSES.USDC;
      
      // Create contract instances
      const contract = new ethers.Contract(contractAddress, TIPPING_CONTRACT_ABI, signer);
      const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, signer);
      
      // Check USDC balance
      const balance = await usdcContract.balanceOf(await signer.getAddress());
      const requiredAmount = ethers.parseUnits(pkg.price.toString(), 6);
      
      if (balance < requiredAmount) {
        setStatus(`Insufficient USDC balance. Need ${pkg.price} USDC.`);
        return;
      }
      
      // Approve USDC spending
      setStatus("Approving USDC...");
      const approveTx = await usdcContract.approve(contractAddress, requiredAmount);
      await approveTx.wait();
      
      // Buy package
      setStatus("Purchasing package...");
      const buyTx = await contract.buyPackage(pkg.name, requiredAmount);
      await buyTx.wait();
      
      // Update user data in Supabase
      const { error: dbError } = await supabase
        .from('users')
        .upsert({ 
          fid: user.fid,
          package_type: pkg.name, 
          premium_expiry: Math.floor(Date.now() / 1000) + 30*24*3600,
          wallet_address: await signer.getAddress()
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