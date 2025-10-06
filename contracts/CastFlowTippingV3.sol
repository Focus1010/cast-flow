// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title CastFlowTippingV3
 * @dev Enhanced tipping contract for Cast Flow with creator-controlled tip pools
 * Features: Multi-token support, automatic refunds, admin controls, gas-optimized
 */
contract CastFlowTippingV3 is ReentrancyGuard, Pausable, Ownable {
    using SafeERC20 for IERC20;

    struct TipPool {
        address creator;
        address token; // 0x0 for ETH
        uint256 amountPerUser;
        uint256 maxRecipients;
        uint256 totalFunded;
        uint256 totalClaimed;
        uint256 expiresAt;
        bool active;
        mapping(address => bool) hasClaimed;
    }

    struct UserTips {
        uint256 totalETH;
        uint256 totalUSDC;
        uint256 totalENB;
        uint256 totalCastFlow;
        mapping(address => uint256) tokenBalances;
    }

    // State variables
    mapping(uint256 => TipPool) public tipPools;
    mapping(address => UserTips) public userTips;
    mapping(address => bool) public admins;
    
    uint256 public nextPoolId = 1;
    uint256 public constant REFUND_PERIOD = 30 days;
    
    // Supported tokens
    address public constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913; // Base USDC
    address public ENB_TOKEN;
    address public CASTFLOW_TOKEN;

    // Events
    event TipPoolCreated(uint256 indexed poolId, address indexed creator, address token, uint256 amountPerUser, uint256 maxRecipients);
    event TipPoolFunded(uint256 indexed poolId, uint256 amount);
    event TipClaimed(uint256 indexed poolId, address indexed user, uint256 amount);
    event TipPoolRefunded(uint256 indexed poolId, uint256 amount);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner(), "Not admin");
        _;
    }

    constructor() {
        admins[msg.sender] = true;
    }

    /**
     * @dev Create a new tip pool for a post
     */
    function createTipPool(
        address token,
        uint256 amountPerUser,
        uint256 maxRecipients
    ) external payable nonReentrant whenNotPaused returns (uint256 poolId) {
        require(amountPerUser > 0, "Amount must be > 0");
        require(maxRecipients > 0, "Max recipients must be > 0");
        
        poolId = nextPoolId++;
        TipPool storage pool = tipPools[poolId];
        
        pool.creator = msg.sender;
        pool.token = token;
        pool.amountPerUser = amountPerUser;
        pool.maxRecipients = maxRecipients;
        pool.expiresAt = block.timestamp + REFUND_PERIOD;
        pool.active = true;

        uint256 totalRequired = amountPerUser * maxRecipients;

        if (token == address(0)) {
            // ETH tip pool
            require(msg.value >= totalRequired, "Insufficient ETH");
            pool.totalFunded = msg.value;
        } else {
            // ERC20 tip pool
            require(msg.value == 0, "No ETH for token pools");
            IERC20(token).safeTransferFrom(msg.sender, address(this), totalRequired);
            pool.totalFunded = totalRequired;
        }

        emit TipPoolCreated(poolId, msg.sender, token, amountPerUser, maxRecipients);
        emit TipPoolFunded(poolId, pool.totalFunded);
    }

    /**
     * @dev Claim tip from a pool (called by interaction tracking system)
     */
    function claimTip(uint256 poolId, address user) external onlyAdmin nonReentrant {
        TipPool storage pool = tipPools[poolId];
        require(pool.active, "Pool not active");
        require(block.timestamp < pool.expiresAt, "Pool expired");
        require(!pool.hasClaimed[user], "Already claimed");
        require(pool.totalClaimed + pool.amountPerUser <= pool.totalFunded, "Insufficient funds");

        pool.hasClaimed[user] = true;
        pool.totalClaimed += pool.amountPerUser;

        // Update user tips tracking
        UserTips storage userTip = userTips[user];
        
        if (pool.token == address(0)) {
            userTip.totalETH += pool.amountPerUser;
            payable(user).transfer(pool.amountPerUser);
        } else {
            userTip.tokenBalances[pool.token] += pool.amountPerUser;
            
            // Update specific token counters
            if (pool.token == USDC) {
                userTip.totalUSDC += pool.amountPerUser;
            } else if (pool.token == ENB_TOKEN) {
                userTip.totalENB += pool.amountPerUser;
            } else if (pool.token == CASTFLOW_TOKEN) {
                userTip.totalCastFlow += pool.amountPerUser;
            }
            
            IERC20(pool.token).safeTransfer(user, pool.amountPerUser);
        }

        emit TipClaimed(poolId, user, pool.amountPerUser);
    }

    /**
     * @dev Refund expired tip pool to creator
     */
    function refundExpiredPool(uint256 poolId) external nonReentrant {
        TipPool storage pool = tipPools[poolId];
        require(pool.active, "Pool not active");
        require(block.timestamp >= pool.expiresAt, "Pool not expired");
        require(msg.sender == pool.creator || admins[msg.sender], "Not authorized");

        uint256 refundAmount = pool.totalFunded - pool.totalClaimed;
        require(refundAmount > 0, "Nothing to refund");

        pool.active = false;

        if (pool.token == address(0)) {
            payable(pool.creator).transfer(refundAmount);
        } else {
            IERC20(pool.token).safeTransfer(pool.creator, refundAmount);
        }

        emit TipPoolRefunded(poolId, refundAmount);
    }

    /**
     * @dev Get user's claimable tips for a specific token
     */
    function getUserTips(address user, address token) external view returns (uint256) {
        if (token == address(0)) {
            return userTips[user].totalETH;
        } else if (token == USDC) {
            return userTips[user].totalUSDC;
        } else if (token == ENB_TOKEN) {
            return userTips[user].totalENB;
        } else if (token == CASTFLOW_TOKEN) {
            return userTips[user].totalCastFlow;
        }
        return userTips[user].tokenBalances[token];
    }

    /**
     * @dev Check if user has claimed from a specific pool
     */
    function hasClaimed(uint256 poolId, address user) external view returns (bool) {
        return tipPools[poolId].hasClaimed[user];
    }

    /**
     * @dev Get tip pool details
     */
    function getTipPool(uint256 poolId) external view returns (
        address creator,
        address token,
        uint256 amountPerUser,
        uint256 maxRecipients,
        uint256 totalFunded,
        uint256 totalClaimed,
        uint256 expiresAt,
        bool active
    ) {
        TipPool storage pool = tipPools[poolId];
        return (
            pool.creator,
            pool.token,
            pool.amountPerUser,
            pool.maxRecipients,
            pool.totalFunded,
            pool.totalClaimed,
            pool.expiresAt,
            pool.active
        );
    }

    // Admin functions
    function addAdmin(address admin) external onlyOwner {
        admins[admin] = true;
        emit AdminAdded(admin);
    }

    function removeAdmin(address admin) external onlyOwner {
        admins[admin] = false;
        emit AdminRemoved(admin);
    }

    function setTokenAddresses(address _enb, address _castflow) external onlyOwner {
        ENB_TOKEN = _enb;
        CASTFLOW_TOKEN = _castflow;
    }

    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    // Emergency functions
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    receive() external payable {}
}
