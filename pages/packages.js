import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import contractABI from "../utils/contractABI.json";

export default function PackagesPage() {
  const { user, authenticated, login } = useAuth();
  const [status, setStatus] = useState("");
  const [packages, setPackages] = useState([
    { name: "Starter", price: 5, posts: 15 },
    { name: "Pro", price: 10, posts: 30 },
    { name: "Elite", price: 20, posts: 60 },
  ]);

  const handleBuy = async (pkg) => {
    if (!user) return alert("Sign in first.");
    
    // Try to connect wallet if not connected
    if (!window.ethereum) {
      try {
        // Request wallet connection
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        return alert("Please install MetaMask or connect your wallet first.");
      }
    }
    
    setStatus("Processing purchase...");
    
    try {
      // Connect to user's wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Contract addresses (update these with your actual addresses)
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x...";
      const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC
      
      // Create contract instances
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const usdcContract = new ethers.Contract(
        usdcAddress, 
        ["function approve(address,uint256) external returns (bool)", "function balanceOf(address) external view returns (uint256)"], 
        signer
      );
      
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