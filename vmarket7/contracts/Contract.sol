// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC20} from "@thirdweb-dev/contracts/eip/interface/IERC20.sol";
import {Ownable} from "@thirdweb-dev/contracts/extension/Ownable.sol";
import {ReentrancyGuard} from "@thirdweb-dev/contracts/external-deps/openzeppelin/security/ReentrancyGuard.sol";

/**
 * @title vmarketCONTRACT7
 * @dev A prediction market contract where users can bet on outcomes and claim winnings based on the result.
 */
contract vmarketCONTRACT7 is Ownable, ReentrancyGuard {
    /// @dev Represents a prediction market.
    struct Market {
        string question;
        uint256 endTime;
        uint8 outcome; // Index of the winning option: 0 for unresolved, 1-3 for outcomes
        string[3] options; // Fixed-size array for up to 3 options
        uint256[3] totalShares; // Total shares for each option
        bool resolved;
        mapping(address => uint256[3]) sharesBalance; // User shares for each option
        mapping(address => bool) hasClaimed;
        bool refunded; // Indicates if the market was refunded
    }

    /// @notice The ERC20 token used for betting.
    IERC20 public bettingToken;

    /// @notice Global market count and mapping from market ID to Market struct.
    uint256 public marketCount;
    mapping(uint256 => Market) public markets;

    /// @notice Fee-related state variables.
    address public feeRecipient;
    uint256 public feePercentage; // e.g., 1 means 1%

    /// @notice Emitted when a new market is created.
    event MarketCreated(
        uint256 indexed marketId,
        string question,
        string[] options,
        uint256 endTime
    );

    /// @notice Emitted when shares are purchased in a market.
    event SharesPurchased(
        uint256 indexed marketId,
        address indexed buyer,
        uint256 optionIndex,
        uint256 amount
    );

    /// @notice Emitted when a market is resolved with an outcome.
    event MarketResolved(uint256 indexed marketId, uint8 outcome);

    /// @notice Emitted when winnings are claimed by a user.
    event Claimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    /**
     * @dev Constructor: set the betting token, fee recipient, and fee percentage.
     * @param _bettingToken The address of the ERC20 token used for betting.
     * @param _feeRecipient The address that receives fees (e.g., your split contract).
     * @param _feePercentage The fee in %, e.g., 1 for 1%.
     */
    constructor(
        address _bettingToken,
        address _feeRecipient,
        uint256 _feePercentage
    ) {
        bettingToken = IERC20(_bettingToken);
        feeRecipient = _feeRecipient;
        feePercentage = _feePercentage;
        _setupOwner(msg.sender); // Set the contract deployer as the owner
    }

    /**
     * @dev Allows the owner to update the fee recipient on the fly.
     * @param _feeRecipient The new fee recipient address.
     */
    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Allows the owner to update the fee percentage on the fly.
     * @param _feePercentage The new fee percentage, e.g., 1 for 1%.
     */
    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        feePercentage = _feePercentage;
    }

    /// @dev Override from Ownable to check if caller is owner for setting ownership.
    function _canSetOwner() internal view virtual override returns (bool) {
        return msg.sender == owner();
    }

    /**
     * @notice Creates a new prediction market.
     * @param _question The question for the market.
     * @param _options The options for the market.
     * @param _duration The duration for which the market is active.
     * @return marketId The ID of the newly created market.
     */
    function createMarket(
        string memory _question,
        string[] memory _options,
        uint256 _duration
    ) external returns (uint256) {
        require(msg.sender == owner(), "Only owner can create markets");
        require(_duration > 0, "Duration must be positive");
        require(
            _options.length >= 2 && _options.length <= 3,
            "Must have 2 or 3 options"
        );

        uint256 marketId = marketCount++;
        Market storage market = markets[marketId];

        market.question = _question;
        market.endTime = block.timestamp + _duration;
        market.outcome = 0; // Unresolved state

        for (uint256 i = 0; i < _options.length; i++) {
            market.options[i] = _options[i];
        }

        emit MarketCreated(marketId, _question, _options, market.endTime);
        return marketId;
    }

    /**
     * @notice Allows users to buy shares in a market.
     * @param _marketId The ID of the market to buy shares in.
     * @param _optionIndex The index of the option to buy shares for.
     * @param _amount The amount of shares to buy.
     */
    function buyShares(
        uint256 _marketId,
        uint256 _optionIndex,
        uint256 _amount
    ) external {
        Market storage market = markets[_marketId];
        require(
            block.timestamp < market.endTime,
            "Market trading period has ended"
        );
        require(!market.resolved, "Market already resolved");
        require(_optionIndex < 3, "Invalid option index");
        require(
            bytes(market.options[_optionIndex]).length > 0,
            "Option not initialized"
        );
        require(_amount > 0, "Amount must be positive");

        market.sharesBalance[msg.sender][_optionIndex] += _amount;
        market.totalShares[_optionIndex] += _amount;

        require(
            bettingToken.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );

        emit SharesPurchased(_marketId, msg.sender, _optionIndex, _amount);
    }

    /**
     * @notice Resolves a market by setting the outcome.
     * @param _marketId The ID of the market to resolve.
     * @param _outcome The outcome to set for the market.
     */
    function resolveMarket(uint256 _marketId, uint8 _outcome) external {
        require(msg.sender == owner(), "Only owner can resolve markets");
        Market storage market = markets[_marketId];
        require(block.timestamp >= market.endTime, "Market hasn't ended yet");
        require(!market.resolved, "Market already resolved");
        require(_outcome < 3, "Invalid outcome");
        require(bytes(market.options[_outcome]).length > 0, "Option not initialized");

        market.outcome = _outcome;
        market.resolved = true;

        emit MarketResolved(_marketId, _outcome);
    }

    /**
     * @notice Claims winnings for the caller if they participated in a resolved market.
     * @param _marketId The ID of the market to claim winnings from.
     */
    function claimWinnings(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved yet");

        uint256 userShares = market.sharesBalance[msg.sender][market.outcome];
        require(userShares > 0, "No winnings to claim");

        // Calculate total shares staked on the losing options
        uint256 losingShares = 0;
        for (uint256 i = 0; i < 3; i++) {
            if (i != market.outcome && bytes(market.options[i]).length > 0) {
                losingShares += market.totalShares[i];
            }
        }

        // Calculate the user's total winnings (original shares + proportionate share of losing side)
        uint256 rewardRatio = (losingShares * 1e18) / market.totalShares[market.outcome];
        uint256 winnings = userShares + (userShares * rewardRatio) / 1e18;

        // Clear the user's shares for the winning outcome to prevent re-claims
        market.sharesBalance[msg.sender][market.outcome] = 0;

        // ---- Fee Calculation & Transfer ----
        uint256 fee = (winnings * feePercentage) / 100; 
        uint256 netWinnings = winnings - fee;

        // Transfer the fee to the feeRecipient
        require(bettingToken.transfer(feeRecipient, fee), "Fee transfer failed");

        // Transfer the remainder to the user
        require(bettingToken.transfer(msg.sender, netWinnings), "Token transfer failed");

        emit Claimed(_marketId, msg.sender, winnings);
    }

    /**
     * @notice Returns detailed information about a specific market.
     * @param _marketId The ID of the market to retrieve information for.
     * @return question The market's question.
     * @return options The options for the market.
     * @return endTime The end time of the market.
     * @return outcome The outcome of the market.
     * @return totalShares Total shares bought for each option.
     * @return resolved Whether the market has been resolved.
     */
    function getMarketInfo(
        uint256 _marketId
    )
        external
        view
        returns (
            string memory question,
            string[3] memory options,
            uint256 endTime,
            uint8 outcome,
            uint256[3] memory totalShares,
            bool resolved
        )
    {
        Market storage market = markets[_marketId];
        return (
            market.question,
            market.options,
            market.endTime,
            market.outcome,
            market.totalShares,
            market.resolved
        );
    }

    /**
     * @notice Returns the shares balance for a specific user in a market.
     * @param _marketId The ID of the market to check.
     * @param _user The address of the user to check balance for.
     * @return sharesBalance The user's shares balance for each option.
     */
    function getSharesBalance(
        uint256 _marketId,
        address _user
    ) external view returns (uint256[3] memory sharesBalance) {
        Market storage market = markets[_marketId];
        return market.sharesBalance[_user];
    }
}