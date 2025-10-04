import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TIPPING_CONTRACT_ABI, ERC20_ABI, CONTRACT_ADDRESSES, CONTRACT_HELPERS } from '../utils/contractABI';

export default function TipPoolManager({ user, postId, onTipPoolCreated }) {
  const [loading, setLoading] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [maxClaims, setMaxClaims] = useState('10');
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [supportedTokens, setSupportedTokens] = useState([]);
  const [existingPool, setExistingPool] = useState(null);

  // Load supported tokens and existing pool
  useEffect(() => {
    loadSupportedTokens();
    loadExistingPool();
  }, [postId]);

  const loadSupportedTokens = async () => {
    try {
      if (!window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.TIPPING_CONTRACT,
        TIPPING_CONTRACT_ABI,
        provider
      );

      const tokens = await contract.getSupportedTokens();
      const tokenData = await Promise.all(
        tokens.map(async (tokenAddress) => {
          const tokenInfo = await contract.supportedTokens(tokenAddress);
          const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const symbol = await tokenContract.symbol();
          
          return {
            address: tokenAddress,
            symbol: symbol,
            minAmount: tokenInfo.minTipAmount,
            isActive: tokenInfo.isActive
          };
        })
      );

      setSupportedTokens([
        { address: 'ETH', symbol: 'ETH', minAmount: ethers.parseEther('0.001'), isActive: true },
        ...tokenData.filter(token => token.isActive)
      ]);
    } catch (error) {
      console.error('Error loading supported tokens:', error);
    }
  };

  const loadExistingPool = async () => {
    try {
      if (!window.ethereum || !postId) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.TIPPING_CONTRACT,
        TIPPING_CONTRACT_ABI,
        provider
      );

      const poolData = await contract.getTipPool(CONTRACT_HELPERS.formatPostId(postId));
      
      if (poolData[7]) { // isActive
        setExistingPool(CONTRACT_HELPERS.parseTipPool(poolData));
      }
    } catch (error) {
      console.error('Error loading existing pool:', error);
    }
  };

  const createTipPool = async () => {
    if (!user || !tipAmount || !maxClaims) {
      alert('Please fill all fields');
      return;
    }

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
      const claimCount = parseInt(maxClaims);

      let tx;
      
      if (selectedToken === 'ETH') {
        // Create ETH tip pool
        const ethAmount = ethers.parseEther(tipAmount);
        tx = await contract.createTipPoolETH(formattedPostId, claimCount, {
          value: ethAmount
        });
      } else {
        // Create token tip pool
        const tokenInfo = supportedTokens.find(t => t.address === selectedToken);
        const tokenContract = new ethers.Contract(selectedToken, ERC20_ABI, signer);
        
        // Get token decimals
        const decimals = await tokenContract.decimals();
        const tokenAmount = ethers.parseUnits(tipAmount, decimals);
        
        // Check allowance
        const allowance = await tokenContract.allowance(
          await signer.getAddress(),
          CONTRACT_ADDRESSES.TIPPING_CONTRACT
        );
        
        if (allowance < tokenAmount) {
          // Approve tokens first
          const approveTx = await tokenContract.approve(
            CONTRACT_ADDRESSES.TIPPING_CONTRACT,
            tokenAmount
          );
          await approveTx.wait();
        }
        
        // Create token tip pool
        tx = await contract.createTipPoolToken(
          formattedPostId,
          selectedToken,
          tokenAmount,
          claimCount
        );
      }

      await tx.wait();
      
      alert('Tip pool created successfully! 🎉');
      
      // Reload existing pool
      await loadExistingPool();
      
      // Callback to parent component
      if (onTipPoolCreated) {
        onTipPoolCreated();
      }
      
      // Reset form
      setTipAmount('');
      setMaxClaims('10');
      
    } catch (error) {
      console.error('Error creating tip pool:', error);
      alert('Failed to create tip pool: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const refundTips = async () => {
    if (!existingPool) return;
    
    setLoading(true);
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.TIPPING_CONTRACT,
        TIPPING_CONTRACT_ABI,
        signer
      );

      const tx = await contract.refundUnclaimedTips(CONTRACT_HELPERS.formatPostId(postId));
      await tx.wait();
      
      alert('Tips refunded successfully! 💰');
      await loadExistingPool();
      
    } catch (error) {
      console.error('Error refunding tips:', error);
      alert('Failed to refund tips: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (existingPool) {
    const timeRemaining = CONTRACT_HELPERS.getRefundTimeRemaining(existingPool.createdAt);
    const canRefund = CONTRACT_HELPERS.isRefundAvailable(existingPool.createdAt);
    const tokenSymbol = existingPool.token === ethers.ZeroAddress ? 'ETH' : 
      supportedTokens.find(t => t.address === existingPool.token)?.symbol || 'Unknown';

    return (
      <div className="tip-pool-manager">
        <h4>💰 Tip Pool Active</h4>
        <div className="pool-info">
          <p><strong>Token:</strong> {tokenSymbol}</p>
          <p><strong>Total Amount:</strong> {CONTRACT_HELPERS.formatTokenAmount(existingPool.totalAmount.toString())}</p>
          <p><strong>Claims:</strong> {existingPool.claimCount.toString()}/{existingPool.maxClaims.toString()}</p>
          <p><strong>Claimed Amount:</strong> {CONTRACT_HELPERS.formatTokenAmount(existingPool.claimedAmount.toString())}</p>
          
          {timeRemaining > 0 ? (
            <p><strong>Refund Available In:</strong> {Math.ceil(timeRemaining / (24 * 60 * 60))} days</p>
          ) : (
            <p><strong>Status:</strong> ✅ Refund Available</p>
          )}
        </div>
        
        {canRefund && existingPool.claimedAmount < existingPool.totalAmount && (
          <button 
            onClick={refundTips}
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: '10px' }}
          >
            {loading ? 'Refunding...' : '💰 Refund Unclaimed Tips'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="tip-pool-manager">
      <h4>💰 Create Tip Pool</h4>
      <p className="small">Set aside tokens for fans who engage with your post</p>
      
      <div className="form-group">
        <label>Token:</label>
        <select 
          value={selectedToken} 
          onChange={(e) => setSelectedToken(e.target.value)}
          className="form-control"
        >
          {supportedTokens.map(token => (
            <option key={token.address} value={token.address}>
              {token.symbol}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label>Tip Amount:</label>
        <input
          type="number"
          step="0.001"
          value={tipAmount}
          onChange={(e) => setTipAmount(e.target.value)}
          placeholder="Enter amount"
          className="form-control"
        />
      </div>
      
      <div className="form-group">
        <label>Max Claims:</label>
        <input
          type="number"
          value={maxClaims}
          onChange={(e) => setMaxClaims(e.target.value)}
          placeholder="Number of people who can claim"
          className="form-control"
        />
        <small>Tips will be split equally among claimers</small>
      </div>
      
      <button 
        onClick={createTipPool}
        disabled={loading || !tipAmount || !maxClaims}
        className="btn-primary"
      >
        {loading ? 'Creating...' : '🎯 Create Tip Pool'}
      </button>
    </div>
  );
}
