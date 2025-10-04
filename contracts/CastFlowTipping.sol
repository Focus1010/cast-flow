// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CastFlowTipping is ReentrancyGuard, Ownable, Pausable {
    // Supported tokens
    struct Token {
        address tokenAddress;
        string symbol;
        bool isActive;
        uint256 minTipAmount;
    }
    
    // Package structure
    struct Package {
        string name;
        uint256 priceUSDC;
        uint256 postLimit;
        bool isActive;
    }
    
    // User balance tracking
    struct UserBalance {
        uint256 ethBalance;
        mapping(address => uint256) tokenBalances;
    }
    
    // Events
    event TipSent(
        address indexed from,
        address indexed to,
        address indexed token,
        uint256 amount,
        string postId
    );
    
    event PackagePurchased(
        address indexed buyer,
        uint256 packageId,
        uint256 amount,
        address token
    );
    
    event TokenClaimed(
        address indexed user,
        address indexed token,
        uint256 amount
    );
    
    event TokenAdded(
        address indexed token,
        string symbol,
        uint256 minTipAmount
    );
    
    // State variables
    mapping(address => Token) public supportedTokens;
    mapping(uint256 => Package) public packages;
    mapping(address => UserBalance) private userBalances;
    mapping(address => mapping(string => uint256)) public postTips; // user -> postId -> total tips
    
    address[] public tokenList;
    uint256 public packageCount;
    uint256 public platformFeePercent = 250; // 2.5%
    address public feeRecipient;
    
    // Token addresses (Base network)
    address public constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address public constant ENB = 0x0000000000000000000000000000000000000000; // Replace with actual ENB address
    address public castFlowToken; // Will be set when token launches
    
    constructor() {
        feeRecipient = msg.sender;
        
        // Initialize supported tokens
        _addToken(USDC, "USDC", 1e6); // 1 USDC minimum
        _addToken(ENB, "ENB", 1e18); // 1 ENB minimum
        
        // Initialize packages
        _addPackage("Starter", 5e6, 15); // 5 USDC, 15 posts
        _addPackage("Pro", 10e6, 30); // 10 USDC, 30 posts
        _addPackage("Elite", 20e6, 60); // 20 USDC, 60 posts
    }
    
    // Add new token support
    function addToken(
        address _tokenAddress,
        string memory _symbol,
        uint256 _minTipAmount
    ) external onlyOwner {
        _addToken(_tokenAddress, _symbol, _minTipAmount);
    }
    
    function _addToken(
        address _tokenAddress,
        string memory _symbol,
        uint256 _minTipAmount
    ) internal {
        require(_tokenAddress != address(0), "Invalid token address");
        require(!supportedTokens[_tokenAddress].isActive, "Token already supported");
        
        supportedTokens[_tokenAddress] = Token({
            tokenAddress: _tokenAddress,
            symbol: _symbol,
            isActive: true,
            minTipAmount: _minTipAmount
        });
        
        tokenList.push(_tokenAddress);
        emit TokenAdded(_tokenAddress, _symbol, _minTipAmount);
    }
    
    // Set Cast Flow token when it launches
    function setCastFlowToken(address _tokenAddress) external onlyOwner {
        require(_tokenAddress != address(0), "Invalid token address");
        castFlowToken = _tokenAddress;
        _addToken(_tokenAddress, "CAST", 1e18); // 1 CAST minimum
    }
    
    // Add new package
    function addPackage(
        string memory _name,
        uint256 _priceUSDC,
        uint256 _postLimit
    ) external onlyOwner {
        _addPackage(_name, _priceUSDC, _postLimit);
    }
    
    function _addPackage(
        string memory _name,
        uint256 _priceUSDC,
        uint256 _postLimit
    ) internal {
        packages[packageCount] = Package({
            name: _name,
            priceUSDC: _priceUSDC,
            postLimit: _postLimit,
            isActive: true
        });
        packageCount++;
    }
    
    // Send tip in ETH
    function tipETH(address _to, string memory _postId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(_to != address(0), "Invalid recipient");
        require(_to != msg.sender, "Cannot tip yourself");
        require(msg.value > 0, "Must send ETH");
        
        uint256 fee = (msg.value * platformFeePercent) / 10000;
        uint256 tipAmount = msg.value - fee;
        
        // Add to recipient's claimable balance
        userBalances[_to].ethBalance += tipAmount;
        
        // Track post tips
        postTips[_to][_postId] += tipAmount;
        
        // Send fee to platform
        if (fee > 0) {
            payable(feeRecipient).transfer(fee);
        }
        
        emit TipSent(msg.sender, _to, address(0), tipAmount, _postId);
    }
    
    // Send tip in ERC20 token
    function tipToken(
        address _to,
        address _token,
        uint256 _amount,
        string memory _postId
    ) external nonReentrant whenNotPaused {
        require(_to != address(0), "Invalid recipient");
        require(_to != msg.sender, "Cannot tip yourself");
        require(supportedTokens[_token].isActive, "Token not supported");
        require(_amount >= supportedTokens[_token].minTipAmount, "Amount below minimum");
        
        IERC20 token = IERC20(_token);
        require(token.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        uint256 fee = (_amount * platformFeePercent) / 10000;
        uint256 tipAmount = _amount - fee;
        
        // Add to recipient's claimable balance
        userBalances[_to].tokenBalances[_token] += tipAmount;
        
        // Track post tips
        postTips[_to][_postId] += tipAmount;
        
        // Send fee to platform
        if (fee > 0) {
            token.transfer(feeRecipient, fee);
        }
        
        emit TipSent(msg.sender, _to, _token, tipAmount, _postId);
    }
    
    // Purchase package with USDC
    function purchasePackage(uint256 _packageId) external nonReentrant whenNotPaused {
        require(_packageId < packageCount, "Invalid package");
        require(packages[_packageId].isActive, "Package not active");
        
        Package memory pkg = packages[_packageId];
        IERC20 usdc = IERC20(USDC);
        
        require(usdc.transferFrom(msg.sender, feeRecipient, pkg.priceUSDC), "Payment failed");
        
        emit PackagePurchased(msg.sender, _packageId, pkg.priceUSDC, USDC);
    }
    
    // Claim ETH balance
    function claimETH() external nonReentrant {
        uint256 balance = userBalances[msg.sender].ethBalance;
        require(balance > 0, "No ETH to claim");
        
        userBalances[msg.sender].ethBalance = 0;
        payable(msg.sender).transfer(balance);
        
        emit TokenClaimed(msg.sender, address(0), balance);
    }
    
    // Claim token balance
    function claimToken(address _token) external nonReentrant {
        require(supportedTokens[_token].isActive, "Token not supported");
        
        uint256 balance = userBalances[msg.sender].tokenBalances[_token];
        require(balance > 0, "No tokens to claim");
        
        userBalances[msg.sender].tokenBalances[_token] = 0;
        IERC20(_token).transfer(msg.sender, balance);
        
        emit TokenClaimed(msg.sender, _token, balance);
    }
    
    // View functions
    function getClaimableETH(address _user) external view returns (uint256) {
        return userBalances[_user].ethBalance;
    }
    
    function getClaimableTokens(address _user, address _token) external view returns (uint256) {
        return userBalances[_user].tokenBalances[_token];
    }
    
    function getPostTips(address _user, string memory _postId) external view returns (uint256) {
        return postTips[_user][_postId];
    }
    
    function getSupportedTokens() external view returns (address[] memory) {
        return tokenList;
    }
    
    function getPackage(uint256 _packageId) external view returns (Package memory) {
        return packages[_packageId];
    }
    
    // Admin functions
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 1000, "Fee too high"); // Max 10%
        platformFeePercent = _feePercent;
    }
    
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "Invalid address");
        feeRecipient = _feeRecipient;
    }
    
    function toggleToken(address _token) external onlyOwner {
        supportedTokens[_token].isActive = !supportedTokens[_token].isActive;
    }
    
    function togglePackage(uint256 _packageId) external onlyOwner {
        packages[_packageId].isActive = !packages[_packageId].isActive;
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // Emergency functions
    function emergencyWithdrawETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function emergencyWithdrawToken(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        token.transfer(owner(), token.balanceOf(address(this)));
    }
}
