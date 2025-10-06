// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CastFlowTippingSimple
 * @dev Simplified tipping contract for Cast Flow - Remix IDE compatible
 * Features: Multi-token support, tip pools, admin controls
 */
contract CastFlowTippingSimple {
    
    struct TipPool {
        address creator;
        address token; // address(0) for ETH
        uint256 amountPerUser;
        uint256 maxRecipients;
        uint256 totalFunded;
        uint256 totalClaimed;
        uint256 expiresAt;
        bool active;
    }

    struct UserTips {
        uint256 totalETH;
        uint256 totalUSDC;
        uint256 totalENB;
        uint256 totalCastFlow;
    }

    // State variables
    mapping(uint256 => TipPool) public tipPools;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    mapping(address => UserTips) public userTips;
    mapping(address => bool) public admins;
    
    address public owner;
    uint256 public nextPoolId = 1;
    uint256 public constant REFUND_PERIOD = 30 days;
    bool public paused = false;
    
    // Supported tokens on Base
    address public constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address public ENB_TOKEN;
    address public CASTFLOW_TOKEN;

    // Events
    event TipPoolCreated(uint256 indexed poolId, address indexed creator, address token, uint256 amountPerUser, uint256 maxRecipients);
    event TipPoolFunded(uint256 indexed poolId, uint256 amount);
    event TipClaimed(uint256 indexed poolId, address indexed user, uint256 amount);
    event TipPoolRefunded(uint256 indexed poolId, uint256 amount);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Not admin");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract paused");
        _;
    }

    modifier nonReentrant() {
        require(!_locked, "Reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    bool private _locked;

    constructor() {
        owner = msg.sender;
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
        
        uint256 totalRequired = amountPerUser * maxRecipients;

        if (token == address(0)) {
            // ETH tip pool
            require(msg.value >= totalRequired, "Insufficient ETH");
            
            tipPools[poolId] = TipPool({
                creator: msg.sender,
                token: address(0),
                amountPerUser: amountPerUser,
                maxRecipients: maxRecipients,
                totalFunded: msg.value,
                totalClaimed: 0,
                expiresAt: block.timestamp + REFUND_PERIOD,
                active: true
            });
        } else {
            // ERC20 tip pool
            require(msg.value == 0, "No ETH for token pools");
            
            // Transfer tokens from user to contract
            (bool success, bytes memory data) = token.call(
                abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), totalRequired)
            );
            require(success && (data.length == 0 || abi.decode(data, (bool))), "Token transfer failed");
            
            tipPools[poolId] = TipPool({
                creator: msg.sender,
                token: token,
                amountPerUser: amountPerUser,
                maxRecipients: maxRecipients,
                totalFunded: totalRequired,
                totalClaimed: 0,
                expiresAt: block.timestamp + REFUND_PERIOD,
                active: true
            });
        }

        emit TipPoolCreated(poolId, msg.sender, token, amountPerUser, maxRecipients);
        emit TipPoolFunded(poolId, tipPools[poolId].totalFunded);
    }

    /**
     * @dev Claim tip from a pool (called by interaction tracking system)
     */
    function claimTip(uint256 poolId, address user) external onlyAdmin nonReentrant {
        TipPool storage pool = tipPools[poolId];
        require(pool.active, "Pool not active");
        require(block.timestamp < pool.expiresAt, "Pool expired");
        require(!hasClaimed[poolId][user], "Already claimed");
        require(pool.totalClaimed + pool.amountPerUser <= pool.totalFunded, "Insufficient funds");

        hasClaimed[poolId][user] = true;
        pool.totalClaimed += pool.amountPerUser;

        // Update user tips tracking
        UserTips storage userTip = userTips[user];
        
        if (pool.token == address(0)) {
            // ETH transfer
            userTip.totalETH += pool.amountPerUser;
            (bool success, ) = payable(user).call{value: pool.amountPerUser}("");
            require(success, "ETH transfer failed");
        } else {
            // ERC20 transfer
            if (pool.token == USDC) {
                userTip.totalUSDC += pool.amountPerUser;
            } else if (pool.token == ENB_TOKEN) {
                userTip.totalENB += pool.amountPerUser;
            } else if (pool.token == CASTFLOW_TOKEN) {
                userTip.totalCastFlow += pool.amountPerUser;
            }
            
            (bool success, bytes memory data) = pool.token.call(
                abi.encodeWithSignature("transfer(address,uint256)", user, pool.amountPerUser)
            );
            require(success && (data.length == 0 || abi.decode(data, (bool))), "Token transfer failed");
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
            (bool success, ) = payable(pool.creator).call{value: refundAmount}("");
            require(success, "ETH refund failed");
        } else {
            (bool success, bytes memory data) = pool.token.call(
                abi.encodeWithSignature("transfer(address,uint256)", pool.creator, refundAmount)
            );
            require(success && (data.length == 0 || abi.decode(data, (bool))), "Token refund failed");
        }

        emit TipPoolRefunded(poolId, refundAmount);
    }

    /**
     * @dev Get user's claimable tips for a specific token
     */
    function getUserTips(address user, address token) external view returns (uint256) {
        UserTips storage tips = userTips[user];
        
        if (token == address(0)) {
            return tips.totalETH;
        } else if (token == USDC) {
            return tips.totalUSDC;
        } else if (token == ENB_TOKEN) {
            return tips.totalENB;
        } else if (token == CASTFLOW_TOKEN) {
            return tips.totalCastFlow;
        }
        
        return 0;
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
        paused = true;
    }

    function unpause() external onlyAdmin {
        paused = false;
    }

    // Emergency functions
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            (bool success, ) = payable(owner).call{value: amount}("");
            require(success, "ETH withdrawal failed");
        } else {
            (bool success, bytes memory data) = token.call(
                abi.encodeWithSignature("transfer(address,uint256)", owner, amount)
            );
            require(success && (data.length == 0 || abi.decode(data, (bool))), "Token withdrawal failed");
        }
    }

    // Transfer ownership
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    receive() external payable {}
}
