import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

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
    try {
      const provider = new ethers.JsonRpcProvider("YOUR_BASE_RPC_URL");
      const wallet = new ethers.Wallet("PRIVATE_KEY", provider); // In frontend, use window.ethereum
      const contract = new ethers.Contract(contractAddress, contractABI, wallet);
      const usdc = new ethers.Contract("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", ["function approve(address,uint256)"], wallet);
      await usdc.approve(contractAddress, ethers.utils.parseUnits(pkg.price.toString(), 6)); // USDC 6 decimals
      await contract.buyPackage(pkg.name, ethers.utils.parseUnits(pkg.price.toString(), 6));
      await supabase.from('users').update({ package_type: pkg.name, premium_expiry: Math.floor(Date.now() / 1000) + 30*24*3600 }).eq('fid', user.fid);
      setStatus("Package bought!");
    } catch (error) {
      setStatus("Buy failed: " + error.message);
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