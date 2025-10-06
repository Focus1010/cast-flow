// Smart contract ABI and functions for on-chain scheduling
export const SCHEDULING_CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "contentHash", "type": "string"},
      {"internalType": "uint256", "name": "scheduledTime", "type": "uint256"},
      {"internalType": "address[]", "name": "tipTokens", "type": "address[]"},
      {"internalType": "uint256[]", "name": "tipAmounts", "type": "uint256[]"}
    ],
    "name": "schedulePost",
    "outputs": [{"internalType": "uint256", "name": "postId", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "postId", "type": "uint256"}],
    "name": "getScheduledPost",
    "outputs": [
      {"internalType": "address", "name": "creator", "type": "address"},
      {"internalType": "string", "name": "contentHash", "type": "string"},
      {"internalType": "uint256", "name": "scheduledTime", "type": "uint256"},
      {"internalType": "bool", "name": "isPosted", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "postId", "type": "uint256"},
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "string", "name": "interactionType", "type": "string"}
    ],
    "name": "recordInteraction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "postId", "type": "uint256"},
      {"internalType": "address", "name": "token", "type": "address"}
    ],
    "name": "claimTip",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract addresses - will be set after deployment
export const SCHEDULING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SCHEDULING_CONTRACT_ADDRESS || "";

// Helper functions for contract interactions
export const createScheduleTransaction = (contentHash, scheduledTime, tipTokens, tipAmounts) => {
  return {
    address: SCHEDULING_CONTRACT_ADDRESS,
    abi: SCHEDULING_CONTRACT_ABI,
    functionName: 'schedulePost',
    args: [contentHash, scheduledTime, tipTokens, tipAmounts],
    value: '10000000000000000' // 0.01 ETH scheduling fee
  };
};

export const createTipClaimTransaction = (postId, tokenAddress) => {
  return {
    address: SCHEDULING_CONTRACT_ADDRESS,
    abi: SCHEDULING_CONTRACT_ABI,
    functionName: 'claimTip',
    args: [postId, tokenAddress]
  };
};
