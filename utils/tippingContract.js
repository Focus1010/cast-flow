// Utility functions for interacting with the CastFlowTippingSimple contract
import { ethers } from 'ethers';
import tippingABI from './tippingContractABI.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS;

/**
 * Get contract instance with signer
 */
export function getTippingContract(signer) {
  if (!CONTRACT_ADDRESS) {
    throw new Error('NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS not set in environment');
  }
  return new ethers.Contract(CONTRACT_ADDRESS, tippingABI, signer);
}

/**
 * Get contract instance for read-only operations
 */
export function getTippingContractReadOnly(provider) {
  if (!CONTRACT_ADDRESS) {
    throw new Error('NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS not set in environment');
  }
  return new ethers.Contract(CONTRACT_ADDRESS, tippingABI, provider);
}

/**
 * Create a new tip pool
 * @param {Object} signer - Ethers signer
 * @param {string} token - Token address (use ethers.ZeroAddress for ETH)
 * @param {string} amountPerUser - Amount per user in wei
 * @param {number} maxRecipients - Maximum number of recipients
 * @param {string} totalValue - Total ETH value to send (for ETH pools)
 */
export async function createTipPool(signer, token, amountPerUser, maxRecipients, totalValue = '0') {
  try {
    const contract = getTippingContract(signer);
    
    const tx = await contract.createTipPool(
      token,
      amountPerUser,
      maxRecipients,
      { value: totalValue }
    );
    
    console.log('🎯 Creating tip pool...', tx.hash);
    const receipt = await tx.wait();
    
    // Find the TipPoolCreated event
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'TipPoolCreated';
      } catch {
        return false;
      }
    });
    
    if (event) {
      const parsed = contract.interface.parseLog(event);
      const poolId = parsed.args.poolId.toString();
      console.log('✅ Tip pool created with ID:', poolId);
      return { success: true, poolId, txHash: tx.hash };
    }
    
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error('❌ Error creating tip pool:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Claim tip from a pool (admin only)
 */
export async function claimTip(signer, poolId, userAddress) {
  try {
    const contract = getTippingContract(signer);
    const tx = await contract.claimTip(poolId, userAddress);
    
    console.log('🎯 Claiming tip...', tx.hash);
    await tx.wait();
    
    console.log('✅ Tip claimed successfully');
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error('❌ Error claiming tip:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get tip pool details
 */
export async function getTipPoolDetails(provider, poolId) {
  try {
    const contract = getTippingContractReadOnly(provider);
    const details = await contract.getTipPool(poolId);
    
    return {
      success: true,
      pool: {
        creator: details.creator,
        token: details.token,
        amountPerUser: details.amountPerUser.toString(),
        maxRecipients: details.maxRecipients.toString(),
        totalFunded: details.totalFunded.toString(),
        totalClaimed: details.totalClaimed.toString(),
        expiresAt: details.expiresAt.toString(),
        active: details.active
      }
    };
  } catch (error) {
    console.error('❌ Error getting tip pool details:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's total tips for a specific token
 */
export async function getUserTips(provider, userAddress, tokenAddress) {
  try {
    const contract = getTippingContractReadOnly(provider);
    const tips = await contract.getUserTips(userAddress, tokenAddress);
    
    return {
      success: true,
      amount: tips.toString()
    };
  } catch (error) {
    console.error('❌ Error getting user tips:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if user has claimed from a specific pool
 */
export async function hasUserClaimed(provider, poolId, userAddress) {
  try {
    const contract = getTippingContractReadOnly(provider);
    const claimed = await contract.hasClaimed(poolId, userAddress);
    
    return { success: true, claimed };
  } catch (error) {
    console.error('❌ Error checking claim status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Set token addresses (owner only)
 */
export async function setTokenAddresses(signer, enbAddress, castflowAddress) {
  try {
    const contract = getTippingContract(signer);
    const tx = await contract.setTokenAddresses(enbAddress, castflowAddress);
    
    console.log('🎯 Setting token addresses...', tx.hash);
    await tx.wait();
    
    console.log('✅ Token addresses set successfully');
    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error('❌ Error setting token addresses:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get contract constants
 */
export async function getContractInfo(provider) {
  try {
    const contract = getTippingContractReadOnly(provider);
    
    const [owner, nextPoolId, paused, usdcAddress, enbAddress, castflowAddress] = await Promise.all([
      contract.owner(),
      contract.nextPoolId(),
      contract.paused(),
      contract.USDC(),
      contract.ENB_TOKEN(),
      contract.CASTFLOW_TOKEN()
    ]);
    
    return {
      success: true,
      info: {
        owner,
        nextPoolId: nextPoolId.toString(),
        paused,
        tokens: {
          usdc: usdcAddress,
          enb: enbAddress,
          castflow: castflowAddress
        }
      }
    };
  } catch (error) {
    console.error('❌ Error getting contract info:', error);
    return { success: false, error: error.message };
  }
}

// Token addresses for easy reference
export const TOKEN_ADDRESSES = {
  ETH: ethers.ZeroAddress,
  USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  ENB: process.env.NEXT_PUBLIC_ENB_TOKEN_ADDRESS,
  CASTFLOW: process.env.NEXT_PUBLIC_CASTFLOW_TOKEN_ADDRESS
};

export { CONTRACT_ADDRESS, tippingABI };
