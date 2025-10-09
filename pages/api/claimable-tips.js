import { ethers } from 'ethers';

// This would be your deployed tipping contract ABI
const TIPPING_CONTRACT_ABI = [
  "function getClaimableAmount(address user, address token) view returns (uint256)",
  "function claimTips(address token) external",
  "function getUserTipPools(address user) view returns (tuple(address token, uint256 amount, uint256 claimLimit, uint256 claimed)[])"
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address parameter is required' });
  }

  try {
    const contractAddress = process.env.NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      // Return empty amounts if contract not deployed yet
      return res.status(200).json({ 
        success: true, 
        claimableAmounts: {
          ETH: "0",
          USDC: "0", 
          ENB: "0",
          FCS: "0"
        },
        message: "Tipping contract not deployed yet"
      });
    }

    // Initialize provider (Base network)
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'
    );

    const contract = new ethers.Contract(contractAddress, TIPPING_CONTRACT_ABI, provider);

    // Token addresses on Base
    const tokens = {
      ETH: ethers.ZeroAddress, // Native ETH
      USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      ENB: process.env.NEXT_PUBLIC_ENB_ADDRESS || ethers.ZeroAddress,
      FCS: process.env.NEXT_PUBLIC_CASTFLOW_TOKEN_ADDRESS || ethers.ZeroAddress
    };

    const claimableAmounts = {};

    // Get claimable amounts for each token
    for (const [symbol, tokenAddress] of Object.entries(tokens)) {
      try {
        const amount = await contract.getClaimableAmount(address, tokenAddress);
        claimableAmounts[symbol] = ethers.formatEther(amount);
      } catch (error) {
        console.error(`Error getting claimable ${symbol}:`, error);
        claimableAmounts[symbol] = "0";
      }
    }

    return res.status(200).json({ 
      success: true, 
      claimableAmounts
    });

  } catch (error) {
    console.error('Claimable tips API error:', error);
    
    // Return zero amounts on error instead of failing
    return res.status(200).json({ 
      success: true, 
      claimableAmounts: {
        ETH: "0",
        USDC: "0",
        ENB: "0", 
        FCS: "0"
      },
      error: error.message
    });
  }
}
