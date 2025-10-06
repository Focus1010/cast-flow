import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useWriteContract, useReadContract } from 'wagmi';
import { TIPPING_CONTRACT_ABI, CONTRACT_ADDRESSES, CONTRACT_HELPERS } from '../utils/contractABI';

export default function TipClaimButton({ user, postId, onTipClaimed }) {
  const [loading, setLoading] = useState(false);
  const [tipPool, setTipPool] = useState(null);
  const [hasClaimed, setHasClaimed] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (user && postId) {
      loadTipPoolInfo();
    }
  }, [user, postId]);

  const loadTipPoolInfo = async () => {
    try {
      // Get Privy embedded wallet
      const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy');
      if (!embeddedWallet) return;
      
      const provider = await embeddedWallet.getEthereumProvider();
      const ethersProvider = new ethers.BrowserProvider(provider);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.TIPPING_CONTRACT,
        TIPPING_CONTRACT_ABI,
        ethersProvider
      );

      const formattedPostId = CONTRACT_HELPERS.formatPostId(postId);
      
      // Get tip pool info
      const poolData = await contract.getTipPool(formattedPostId);
      
      if (poolData[7]) { // isActive
        const pool = CONTRACT_HELPERS.parseTipPool(poolData);
        setTipPool(pool);
        
        // Check if user has already claimed
        const claimed = await contract.hasClaimed(formattedPostId, user.wallet || user.address);
        setHasClaimed(claimed);
        
        // Check if user can claim (pool active, not expired, claims available, not claimed)
        const timeRemaining = CONTRACT_HELPERS.getRefundTimeRemaining(pool.createdAt);
        const claimsAvailable = pool.claimCount < pool.maxClaims;
        const notExpired = timeRemaining > 0;
        
        setCanClaim(!claimed && claimsAvailable && notExpired && pool.isActive);
      }
    } catch (error) {
      console.error('Error loading tip pool info:', error);
    }
  };

  const claimTip = async () => {
    if (!user || !tipPool) return;
    
    setLoading(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.TIPPING_CONTRACT,
        TIPPING_CONTRACT_ABI,
        signer
      );

      const formattedPostId = CONTRACT_HELPERS.formatPostId(postId);
      const tx = await contract.claimTip(formattedPostId);
      await tx.wait();
      
      alert('Tip claimed successfully! 🎉 Check your profile to withdraw.');
      
      // Update state
      setHasClaimed(true);
      setCanClaim(false);
      
      // Reload tip pool info
      await loadTipPoolInfo();
      
      // Callback to parent
      if (onTipClaimed) {
        onTipClaimed();
      }
      
    } catch (error) {
      console.error('Error claiming tip:', error);
      alert('Failed to claim tip: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!tipPool) {
    return null; // No tip pool for this post
  }

  const claimAmount = tipPool.totalAmount / tipPool.maxClaims;
  const tokenSymbol = tipPool.token === ethers.ZeroAddress ? 'ETH' : 'Token';
  const timeRemaining = CONTRACT_HELPERS.getRefundTimeRemaining(tipPool.createdAt);
  const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60));

  return (
    <div className="tip-claim-section">
      <div className="tip-pool-info">
        <h5>💰 Tip Pool Available</h5>
        <p><strong>Claim Amount:</strong> {CONTRACT_HELPERS.formatTokenAmount(claimAmount.toString())} {tokenSymbol}</p>
        <p><strong>Claims:</strong> {tipPool.claimCount}/{tipPool.maxClaims} taken</p>
        {timeRemaining > 0 && (
          <p><strong>Expires in:</strong> {daysRemaining} days</p>
        )}
      </div>
      
      {hasClaimed ? (
        <div className="claimed-status">
          <span className="success">✅ You've claimed this tip!</span>
        </div>
      ) : canClaim ? (
        <button 
          onClick={claimTip}
          disabled={loading}
          className="btn-success"
          style={{ marginTop: '10px' }}
        >
          {loading ? 'Claiming...' : `🎯 Claim ${CONTRACT_HELPERS.formatTokenAmount(claimAmount.toString())} ${tokenSymbol}`}
        </button>
      ) : (
        <div className="cannot-claim">
          {tipPool.claimCount >= tipPool.maxClaims ? (
            <span className="warning">⚠️ All tips claimed</span>
          ) : timeRemaining <= 0 ? (
            <span className="warning">⏰ Claim period expired</span>
          ) : (
            <span className="info">ℹ️ Tip available for engagement</span>
          )}
        </div>
      )}
    </div>
  );
}
