// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CastFlowTippingV2
 * @dev Comprehensive tipping system for Cast Flow mini app
 * Features:
 * - Creator-allocated tip pools for posts
 * - Fan claiming system with 30-day expiry
 * - Package purchasing (payments to admin)
 * - Dynamic token management
 * - Admin unlimited access
 * - Secure refund mechanism
 */
contract CastFlowTippingV2 is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STRUCTS ============
    
    struct TipPool {
        address creator;           // Post creator
        address token;            // Token address (address(0) for ETH)
        uint256 totalAmount;      // Total tip amount allocated
        uint256 claimedAmount;    // Amount already claimed
        uint256 createdAt;        // Timestamp when created
        uint256 claimCount;       // Number of successful claims
        uint256 maxClaims;        // Maximum number of claims allowed
        bool isActive;            // Whether pool is active
        mapping(address => bool) hasClaimed; // Track who claimed
    }
    
    struct Package {
        string name;              // Package name
        uint256 priceUSDC;        // Price in USDC (6 decimals)
        uint256 postLimit;        // Number of posts allowed
        bool isActive;            // Whether package is available
    }
    
    struct SupportedToken {
        string symbol;            // Token symbol
        uint256 minTipAmount;     // Minimum tip amount
        bool isActive;            // Whether token is supported
    }
    
    struct UserBalance {
        mapping(address => uint256) claimableTokens; // token => amount
    }
    
    // ============ STATE VARIABLES ============
    
    // Core mappings
    mapping(string => TipPool) public tipPools;           // postId => TipPool
    mapping(uint256 => Package) public packages;          // packageId => Package
    mapping(address => SupportedToken) public supportedTokens; // token => SupportedToken
    mapping(address => UserBalance) private userBalances; // user => UserBalance
    mapping(address => bool) public hasUnlimitedAccess;   // Admin unlimited access
    
    // Arrays for iteration
    address[] public tokenList;
    string[] public activePools;
    
    // Constants
    uint256 public constant REFUND_PERIOD = 30 days;
    uint256 public packageCount;
    address public immutable adminWallet;
    
    // Base network token addresses
    address public constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    
    // ============ EVENTS ============
    
    event TipPoolCreated(
        string indexed postId,
        address indexed creator,
        address indexed token,
        uint256 amount,
        uint256 maxClaims
    );
    
    event TipClaimed(
        string indexed postId,
        address indexed claimer,
        address indexed token,
        uint256 amount
    );
    
    event TipRefunded(
        string indexed postId,
        address indexed creator,
        address indexed token,
        uint256 amount
    );
    
    event PackagePurchased(
        address indexed buyer,
        uint256 indexed packageId,
        uint256 amount
    );
    
    event TokenAdded(
        address indexed token,
        string symbol,
        uint256 minAmount
    );
    
    event TokenRemoved(address indexed token);
    
    event BalanceClaimed(
        address indexed user,
        address indexed token,
        uint256 amount
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyActiveToken(address _token) {
        require(
            _token == address(0) || supportedTokens[_token].isActive,
            "Token not supported"
        );
        _;
    }
    
    modifier onlyValidPool(string memory _postId) {
        require(tipPools[_postId].isActive, "Pool not active");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor(address _adminWallet) {
        require(_adminWallet != address(0), "Invalid admin wallet");
        adminWallet = _adminWallet;
        
        // Grant unlimited access to admin
        hasUnlimitedAccess[_adminWallet] = true;
        
        // Initialize USDC support
        supportedTokens[USDC] = SupportedToken({
            symbol: "USDC",
            minTipAmount: 1e6, // 1 USDC
            isActive: true
        });
        tokenList.push(USDC);
        
        // Initialize default packages
        _createPackage("Starter", 5e6, 15);   // 5 USDC, 15 posts
        _createPackage("Pro", 10e6, 30);      // 10 USDC, 30 posts
        _createPackage("Elite", 20e6, 60);    // 20 USDC, 60 posts
        
        emit TokenAdded(USDC, "USDC", 1e6);
    }
    
    // ============ TIP POOL FUNCTIONS ============
    
    /**
     * @dev Create a tip pool for a post (ETH)
     * @param _postId Unique post identifier
     * @param _maxClaims Maximum number of claims allowed
     */
    function createTipPoolETH(
        string memory _postId,
        uint256 _maxClaims
    ) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must send ETH");
        require(_maxClaims > 0, "Invalid max claims");
        require(!tipPools[_postId].isActive, "Pool already exists");
        
        _createTipPool(_postId, address(0), msg.value, _maxClaims);
    }
    
    /**
     * @dev Create a tip pool for a post (ERC20 token)
     * @param _postId Unique post identifier
     * @param _token Token contract address
     * @param _amount Amount of tokens to allocate
     * @param _maxClaims Maximum number of claims allowed
     */
    function createTipPoolToken(
        string memory _postId,
        address _token,
        uint256 _amount,
        uint256 _maxClaims
    ) external nonReentrant whenNotPaused onlyActiveToken(_token) {
        require(_amount >= supportedTokens[_token].minTipAmount, "Amount too small");
        require(_maxClaims > 0, "Invalid max claims");
        require(!tipPools[_postId].isActive, "Pool already exists");
        
        // Transfer tokens to contract
        IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        
        _createTipPool(_postId, _token, _amount, _maxClaims);
    }
    
    /**
     * @dev Internal function to create tip pool
     */
    function _createTipPool(
        string memory _postId,
        address _token,
        uint256 _amount,
        uint256 _maxClaims
    ) internal {
        TipPool storage pool = tipPools[_postId];
        pool.creator = msg.sender;
        pool.token = _token;
        pool.totalAmount = _amount;
        pool.claimedAmount = 0;
        pool.createdAt = block.timestamp;
        pool.claimCount = 0;
        pool.maxClaims = _maxClaims;
        pool.isActive = true;
        
        activePools.push(_postId);
        
        emit TipPoolCreated(_postId, msg.sender, _token, _amount, _maxClaims);
    }
    
    /**
     * @dev Claim tip from a post (for fans/engagers)
     * @param _postId Post identifier to claim from
     */
    function claimTip(string memory _postId) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyValidPool(_postId) 
    {
        TipPool storage pool = tipPools[_postId];
        
        require(!pool.hasClaimed[msg.sender], "Already claimed");
        require(pool.claimCount < pool.maxClaims, "No more claims available");
        require(block.timestamp <= pool.createdAt + REFUND_PERIOD, "Claim period expired");
        
        // Calculate claim amount (equal distribution)
        uint256 claimAmount = pool.totalAmount / pool.maxClaims;
        require(claimAmount > 0, "Nothing to claim");
        
        // Update pool state
        pool.hasClaimed[msg.sender] = true;
        pool.claimedAmount += claimAmount;
        pool.claimCount++;
        
        // Add to user's claimable balance
        userBalances[msg.sender].claimableTokens[pool.token] += claimAmount;
        
        emit TipClaimed(_postId, msg.sender, pool.token, claimAmount);
    }
    
    /**
     * @dev Refund unclaimed tips to creator (after 30 days)
     * @param _postId Post identifier
     */
    function refundUnclaimedTips(string memory _postId) 
        external 
        nonReentrant 
        onlyValidPool(_postId) 
    {
        TipPool storage pool = tipPools[_postId];
        
        require(block.timestamp > pool.createdAt + REFUND_PERIOD, "Refund period not reached");
        require(pool.claimedAmount < pool.totalAmount, "Nothing to refund");
        
        uint256 refundAmount = pool.totalAmount - pool.claimedAmount;
        
        // Mark pool as inactive
        pool.isActive = false;
        
        // Refund to creator
        if (pool.token == address(0)) {
            // ETH refund
            payable(pool.creator).transfer(refundAmount);
        } else {
            // Token refund
            IERC20(pool.token).transfer(pool.creator, refundAmount);
        }
        
        emit TipRefunded(_postId, pool.creator, pool.token, refundAmount);
    }
    
    // ============ PACKAGE FUNCTIONS ============
    
    /**
     * @dev Purchase a package with USDC (payment goes directly to admin)
     * @param _packageId Package identifier
     */
    function purchasePackage(uint256 _packageId) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(_packageId < packageCount, "Invalid package");
        Package memory pkg = packages[_packageId];
        require(pkg.isActive, "Package not active");
        
        // Transfer USDC directly to admin wallet
        IERC20(USDC).transferFrom(msg.sender, adminWallet, pkg.priceUSDC);
        
        emit PackagePurchased(msg.sender, _packageId, pkg.priceUSDC);
    }
    
    // ============ CLAIM FUNCTIONS ============
    
    /**
     * @dev Claim accumulated ETH balance
     */
    function claimETH() external nonReentrant {
        uint256 amount = userBalances[msg.sender].claimableTokens[address(0)];
        require(amount > 0, "No ETH to claim");
        
        userBalances[msg.sender].claimableTokens[address(0)] = 0;
        payable(msg.sender).transfer(amount);
        
        emit BalanceClaimed(msg.sender, address(0), amount);
    }
    
    /**
     * @dev Claim accumulated token balance
     * @param _token Token contract address
     */
    function claimTokens(address _token) external nonReentrant {
        require(supportedTokens[_token].isActive, "Token not supported");
        
        uint256 amount = userBalances[msg.sender].claimableTokens[_token];
        require(amount > 0, "No tokens to claim");
        
        userBalances[msg.sender].claimableTokens[_token] = 0;
        IERC20(_token).transfer(msg.sender, amount);
        
        emit BalanceClaimed(msg.sender, _token, amount);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Add a new supported token
     * @param _token Token contract address
     * @param _symbol Token symbol
     * @param _minAmount Minimum tip amount
     */
    function addToken(
        address _token,
        string memory _symbol,
        uint256 _minAmount
    ) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        require(!supportedTokens[_token].isActive, "Token already supported");
        require(_minAmount > 0, "Invalid min amount");
        
        supportedTokens[_token] = SupportedToken({
            symbol: _symbol,
            minTipAmount: _minAmount,
            isActive: true
        });
        
        tokenList.push(_token);
        
        emit TokenAdded(_token, _symbol, _minAmount);
    }
    
    /**
     * @dev Remove token support
     * @param _token Token contract address
     */
    function removeToken(address _token) external onlyOwner {
        require(supportedTokens[_token].isActive, "Token not supported");
        require(_token != USDC, "Cannot remove USDC");
        
        supportedTokens[_token].isActive = false;
        
        // Remove from tokenList
        for (uint256 i = 0; i < tokenList.length; i++) {
            if (tokenList[i] == _token) {
                tokenList[i] = tokenList[tokenList.length - 1];
                tokenList.pop();
                break;
            }
        }
        
        emit TokenRemoved(_token);
    }
    
    /**
     * @dev Add a new package
     * @param _name Package name
     * @param _priceUSDC Price in USDC (6 decimals)
     * @param _postLimit Number of posts allowed
     */
    function addPackage(
        string memory _name,
        uint256 _priceUSDC,
        uint256 _postLimit
    ) external onlyOwner {
        _createPackage(_name, _priceUSDC, _postLimit);
    }
    
    /**
     * @dev Internal function to create package
     */
    function _createPackage(
        string memory _name,
        uint256 _priceUSDC,
        uint256 _postLimit
    ) internal {
        require(_priceUSDC > 0, "Invalid price");
        require(_postLimit > 0, "Invalid post limit");
        
        packages[packageCount] = Package({
            name: _name,
            priceUSDC: _priceUSDC,
            postLimit: _postLimit,
            isActive: true
        });
        
        packageCount++;
    }
    
    /**
     * @dev Grant unlimited access to an address
     * @param _user User address
     * @param _hasAccess Whether to grant access
     */
    function setUnlimitedAccess(address _user, bool _hasAccess) external onlyOwner {
        hasUnlimitedAccess[_user] = _hasAccess;
    }
    
    /**
     * @dev Toggle package availability
     * @param _packageId Package identifier
     */
    function togglePackage(uint256 _packageId) external onlyOwner {
        require(_packageId < packageCount, "Invalid package");
        packages[_packageId].isActive = !packages[_packageId].isActive;
    }
    
    /**
     * @dev Update token minimum amount
     * @param _token Token address
     * @param _minAmount New minimum amount
     */
    function updateTokenMinAmount(address _token, uint256 _minAmount) external onlyOwner {
        require(supportedTokens[_token].isActive, "Token not supported");
        require(_minAmount > 0, "Invalid amount");
        
        supportedTokens[_token].minTipAmount = _minAmount;
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user's claimable balance for a token
     * @param _user User address
     * @param _token Token address (address(0) for ETH)
     */
    function getClaimableBalance(address _user, address _token) 
        external 
        view 
        returns (uint256) 
    {
        return userBalances[_user].claimableTokens[_token];
    }
    
    /**
     * @dev Get tip pool information
     * @param _postId Post identifier
     */
    function getTipPool(string memory _postId) 
        external 
        view 
        returns (
            address creator,
            address token,
            uint256 totalAmount,
            uint256 claimedAmount,
            uint256 createdAt,
            uint256 claimCount,
            uint256 maxClaims,
            bool isActive
        ) 
    {
        TipPool storage pool = tipPools[_postId];
        return (
            pool.creator,
            pool.token,
            pool.totalAmount,
            pool.claimedAmount,
            pool.createdAt,
            pool.claimCount,
            pool.maxClaims,
            pool.isActive
        );
    }
    
    /**
     * @dev Check if user has claimed from a post
     * @param _postId Post identifier
     * @param _user User address
     */
    function hasClaimed(string memory _postId, address _user) 
        external 
        view 
        returns (bool) 
    {
        return tipPools[_postId].hasClaimed[_user];
    }
    
    /**
     * @dev Get all supported tokens
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return tokenList;
    }
    
    /**
     * @dev Get package information
     * @param _packageId Package identifier
     */
    function getPackage(uint256 _packageId) 
        external 
        view 
        returns (Package memory) 
    {
        return packages[_packageId];
    }
    
    /**
     * @dev Get active pools count
     */
    function getActivePoolsCount() external view returns (uint256) {
        return activePools.length;
    }
    
    // ============ EMERGENCY FUNCTIONS ============
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdraw (only for stuck funds)
     */
    function emergencyWithdraw(address _token) external onlyOwner {
        if (_token == address(0)) {
            payable(owner()).transfer(address(this).balance);
        } else {
            IERC20 token = IERC20(_token);
            token.transfer(owner(), token.balanceOf(address(this)));
        }
    }
    
    // ============ RECEIVE FUNCTION ============
    
    receive() external payable {
        // Allow contract to receive ETH
    }
}
