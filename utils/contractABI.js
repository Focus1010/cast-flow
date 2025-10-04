// CastFlowTippingV2 Contract ABI for frontend integration

export const TIPPING_CONTRACT_ABI = [
  // ============ TIP POOL FUNCTIONS ============
  "function createTipPoolETH(string memory _postId, uint256 _maxClaims) external payable",
  "function createTipPoolToken(string memory _postId, address _token, uint256 _amount, uint256 _maxClaims) external",
  "function claimTip(string memory _postId) external",
  "function refundUnclaimedTips(string memory _postId) external",
  
  // ============ PACKAGE FUNCTIONS ============
  "function purchasePackage(uint256 _packageId) external",
  
  // ============ CLAIM FUNCTIONS ============
  "function claimETH() external",
  "function claimTokens(address _token) external",
  
  // ============ VIEW FUNCTIONS ============
  "function getClaimableBalance(address _user, address _token) external view returns (uint256)",
  "function getTipPool(string memory _postId) external view returns (address, address, uint256, uint256, uint256, uint256, uint256, bool)",
  "function hasClaimed(string memory _postId, address _user) external view returns (bool)",
  "function getSupportedTokens() external view returns (address[])",
  "function getPackage(uint256 _packageId) external view returns (tuple(string name, uint256 priceUSDC, uint256 postLimit, bool isActive))",
  "function getActivePoolsCount() external view returns (uint256)",
  "function hasUnlimitedAccess(address _user) external view returns (bool)",
  "function packageCount() external view returns (uint256)",
  "function supportedTokens(address _token) external view returns (tuple(string symbol, uint256 minTipAmount, bool isActive))",
  
  // ============ ADMIN FUNCTIONS ============
  "function addToken(address _token, string memory _symbol, uint256 _minAmount) external",
  "function removeToken(address _token) external",
  "function addPackage(string memory _name, uint256 _priceUSDC, uint256 _postLimit) external",
  "function setUnlimitedAccess(address _user, bool _hasAccess) external",
  "function togglePackage(uint256 _packageId) external",
  "function updateTokenMinAmount(address _token, uint256 _minAmount) external",
  
  // ============ EMERGENCY FUNCTIONS ============
  "function pause() external",
  "function unpause() external",
  "function emergencyWithdraw(address _token) external",
  
  // ============ CONSTANTS ============
  "function REFUND_PERIOD() external view returns (uint256)",
  "function USDC() external view returns (address)",
  "function adminWallet() external view returns (address)",
  "function owner() external view returns (address)"
];

// ERC20 Token ABI (for token interactions)
export const ERC20_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

// Contract addresses (update after deployment)
export const CONTRACT_ADDRESSES = {
  TIPPING_CONTRACT: process.env.NEXT_PUBLIC_TIPPING_CONTRACT_ADDRESS || "",
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
  // Add other token addresses as needed
};

// Helper functions for contract interactions
export const CONTRACT_HELPERS = {
  // Format post ID for contract (ensure consistent format)
  formatPostId: (postId) => {
    return postId.toString().trim();
  },
  
  // Parse tip pool data from contract response
  parseTipPool: (poolData) => {
    return {
      creator: poolData[0],
      token: poolData[1],
      totalAmount: poolData[2],
      claimedAmount: poolData[3],
      createdAt: poolData[4],
      claimCount: poolData[5],
      maxClaims: poolData[6],
      isActive: poolData[7]
    };
  },
  
  // Parse package data from contract response
  parsePackage: (packageData) => {
    return {
      name: packageData.name,
      priceUSDC: packageData.priceUSDC,
      postLimit: packageData.postLimit,
      isActive: packageData.isActive
    };
  },
  
  // Calculate time remaining for refund
  getRefundTimeRemaining: (createdAt) => {
    const REFUND_PERIOD = 30 * 24 * 60 * 60; // 30 days in seconds
    const now = Math.floor(Date.now() / 1000);
    const refundTime = parseInt(createdAt) + REFUND_PERIOD;
    return Math.max(0, refundTime - now);
  },
  
  // Check if refund is available
  isRefundAvailable: (createdAt) => {
    return CONTRACT_HELPERS.getRefundTimeRemaining(createdAt) === 0;
  },
  
  // Format token amount for display
  formatTokenAmount: (amount, decimals = 18) => {
    return (parseFloat(amount) / Math.pow(10, decimals)).toFixed(4);
  }
};
