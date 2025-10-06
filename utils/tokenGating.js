// Token-gated access system for unlimited packages
import { ethers } from 'ethers';
import { supabase } from '../lib/supabase';

// ERC20 ABI for balance checking
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
];

// Default token configurations
const DEFAULT_TOKENS = {
  ENB: {
    address: process.env.NEXT_PUBLIC_ENB_ADDRESS || "0x0000000000000000000000000000000000000000",
    decimals: 18,
    min_amount: "1000" // 1000 ENB tokens
  },
  CASTFLOW: {
    address: process.env.NEXT_PUBLIC_CASTFLOW_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000", 
    decimals: 18,
    min_amount: "500" // 500 Cast Flow tokens
  }
};

// Admin addresses (you can add more)
const ADMIN_ADDRESSES = [
  process.env.NEXT_PUBLIC_ADMIN_ADDRESS?.toLowerCase(),
  // Add more admin addresses here
].filter(Boolean);

/**
 * Check if a user has unlimited access based on token holdings or admin status
 * @param {string} userAddress - User's wallet address
 * @param {string} userFid - User's Farcaster ID
 * @returns {Promise<{hasAccess: boolean, reason: string, tokens?: object}>}
 */
export async function checkUnlimitedAccess(userAddress, userFid) {
  try {
    console.log('🔍 Checking unlimited access for:', { userAddress, userFid });

    // Check if user is admin
    if (userAddress && ADMIN_ADDRESSES.includes(userAddress.toLowerCase())) {
      console.log('👑 Admin access granted');
      return {
        hasAccess: true,
        reason: 'admin',
        message: 'Admin access - unlimited posts'
      };
    }

    // Check if admin FID matches
    if (userFid && userFid === process.env.NEXT_PUBLIC_ADMIN_FID) {
      console.log('👑 Admin FID access granted');
      return {
        hasAccess: true,
        reason: 'admin_fid',
        message: 'Admin FID access - unlimited posts'
      };
    }

    if (!userAddress) {
      return {
        hasAccess: false,
        reason: 'no_wallet',
        message: 'Wallet address required for token gating'
      };
    }

    // Get token configurations from database or use defaults
    let tokenConfigs = DEFAULT_TOKENS;
    try {
      const { data: configData } = await supabase
        .from('admin_config')
        .select('config_value')
        .eq('config_key', 'unlimited_access_tokens')
        .single();
      
      if (configData?.config_value) {
        tokenConfigs = configData.config_value;
      }
    } catch (error) {
      console.log('⚠️ Using default token configs:', error.message);
    }

    // Check token balances
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org');
    const tokenResults = {};

    for (const [symbol, config] of Object.entries(tokenConfigs)) {
      try {
        if (!config.address || config.address === "0x0000000000000000000000000000000000000000") {
          console.log(`⏭️ Skipping ${symbol} - no address configured`);
          continue;
        }

        const contract = new ethers.Contract(config.address, ERC20_ABI, provider);
        const balance = await contract.balanceOf(userAddress);
        const decimals = config.decimals || 18;
        const formattedBalance = ethers.formatUnits(balance, decimals);
        const minAmount = config.min_amount || "0";

        tokenResults[symbol] = {
          balance: formattedBalance,
          required: minAmount,
          hasEnough: parseFloat(formattedBalance) >= parseFloat(minAmount)
        };

        console.log(`💰 ${symbol} balance:`, formattedBalance, 'Required:', minAmount, 'Has enough:', tokenResults[symbol].hasEnough);

        // If user has enough of this token, grant access
        if (tokenResults[symbol].hasEnough) {
          // Update token holdings in database
          await updateTokenHoldings(userAddress, userFid, symbol, config.address, formattedBalance);
          
          return {
            hasAccess: true,
            reason: 'token_holder',
            token: symbol,
            message: `${symbol} holder access - unlimited posts`,
            tokens: tokenResults
          };
        }
      } catch (error) {
        console.error(`❌ Error checking ${symbol} balance:`, error);
        tokenResults[symbol] = {
          balance: "0",
          required: config.min_amount || "0",
          hasEnough: false,
          error: error.message
        };
      }
    }

    return {
      hasAccess: false,
      reason: 'insufficient_tokens',
      message: 'Insufficient token holdings for unlimited access',
      tokens: tokenResults
    };

  } catch (error) {
    console.error('💥 Error in checkUnlimitedAccess:', error);
    return {
      hasAccess: false,
      reason: 'error',
      message: 'Error checking access: ' + error.message
    };
  }
}

/**
 * Update user's token holdings in the database
 */
async function updateTokenHoldings(userAddress, userFid, tokenSymbol, tokenAddress, balance) {
  try {
    await supabase
      .from('token_holdings')
      .upsert({
        user_address: userAddress.toLowerCase(),
        user_fid: userFid,
        token_address: tokenAddress.toLowerCase(),
        token_symbol: tokenSymbol,
        balance: balance,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_address,token_address'
      });
  } catch (error) {
    console.error('❌ Error updating token holdings:', error);
  }
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(userAddress, userFid) {
  const addressMatch = userAddress && ADMIN_ADDRESSES.includes(userAddress.toLowerCase());
  const fidMatch = userFid && userFid === process.env.NEXT_PUBLIC_ADMIN_FID;
  return addressMatch || fidMatch;
}

/**
 * Get current token requirements for unlimited access
 */
export async function getTokenRequirements() {
  try {
    const { data: configData } = await supabase
      .from('admin_config')
      .select('config_value')
      .eq('config_key', 'unlimited_access_tokens')
      .single();
    
    return configData?.config_value || DEFAULT_TOKENS;
  } catch (error) {
    console.error('Error fetching token requirements:', error);
    return DEFAULT_TOKENS;
  }
}
