import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { supabase } from "../lib/supabase";
import contractABI from "../utils/contractABI.json";

const contractAddress = "YOUR_DEPLOYED_ADDRESS";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [tips, setTips] = useState({ ETH: 0, USDC: 0, ENB: 0, FCS: 0 });
  const [claimableTips, setClaimableTips] = useState([]);
  const [claiming, setClaiming] = useState({ ETH: false, USDC: false, ENB: false, FCS: false });
  const [castsUsed, setCastsUsed] = useState(0);
  const [premiumExpiry, setPremiumExpiry] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data) setUser(data.user);
    };
    fetchUser();
  }, []);

  const getContract = () => {
    const provider = new ethers.providers.JsonRpcProvider("YOUR_BASE_RPC_URL");
    const signer = provider.getSigner(user.wallet); // Assume
    return new ethers.Contract(contractAddress, contractABI, signer);
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        const contract = getContract();
        const used = await contract.castsUsed(user.wallet);
        const expiry = await contract.premiumExpiry(user.wallet);
        setCastsUsed(Number(used));
        setPremiumExpiry(Number(expiry));

        const { data: posts } = await supabase.from('scheduled_posts').select('cast_id').eq('user_id', user.fid);
        let newTips = { ETH: 0, USDC: 0, ENB: 0, FCS: 0 };
        let newClaimable = [];

        for (const { cast_id } of posts) {
          const isScheduled = await contract.scheduledPosts(cast_id);
          if (isScheduled) {
            const tokens = [ethers.constants.AddressZero, "USDC_ADDRESS", await contract.enbToken(), await contract.miniAppToken()];
            for (const token of tokens) {
              const tip = await contract.tipPools(cast_id, token);
              const amount = Number(ethers.utils.formatUnits(tip, token === "USDC_ADDRESS" ? 6 : 18));
              const tokenName = token === ethers.constants.AddressZero ? "ETH" : token === "USDC_ADDRESS" ? "USDC" : token === await contract.enbToken() ? "ENB" : "FCS";
              newTips[tokenName] += amount;
              if (tip.gt(0) && await isClaimable(cast_id, token, contract)) {
                newClaimable.push({ castId: cast_id, token: tokenName, amount });
              }
            }
          }
        }
        setTips(newTips);
        setClaimableTips(newClaimable);
        setLoading(false);
      };
      loadData();
    }
  }, [user]);

  const isClaimable = async (castId, token, contract) => {
    const timestamp = await contract.scheduledTimestamps(castId);
    return BigInt(Date.now() / 1000) >= timestamp + BigInt(48 * 3600);
  };

  const handleClaim = async (tokenName) => {
    setClaiming((prev) => ({ ...prev, [tokenName]: true }));
    try {
      const contract = getContract();
      const tokenTips = claimableTips.filter((tip) => tip.token === tokenName);
      for (const { castId, token: tokenAddr } of tokenTips) {
        await contract.withdrawUnclaimedTips(castId, tokenAddr);
      }
      alert(`${tokenName} claimed!`);
      // Reload data
    } catch (error) {
      alert("Claim failed.");
    } finally {
      setClaiming((prev) => ({ ...prev, [tokenName]: false }));
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card">
      <h2 className="mb-3">Profile</h2>
      <div style={{ marginBottom: "16px" }}>
        <label className="small">Farcaster ID (FID)</label>
        <input className="input" type="text" value={user?.fid || ""} readOnly />
      </div>
      <div style={{ marginBottom: "16px" }}>
        <label className="small">Wallet Address</label>
        <input className="input" type="text" value={user?.wallet || ""} readOnly />
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