const marketVestaABI = [
  // Market functions
  "function createMarket(string calldata question, string[] calldata outcomes, uint256 endTime) external returns (uint256)",
  "function resolveMarket(uint256 marketId, uint8 winningOutcome) external",
  "function getMarketCount() external view returns (uint256)",
  "function markets(uint256 marketId) external view returns (address creator, address resolver, string question, string[] outcomes, uint256 endTime, uint8 state)",
  
  // Role management functions
  "function addAdmin(address account) external",
  "function removeAdmin(address account) external",
  "function addResolver(address account) external",
  "function removeResolver(address account) external",
  "function isAdmin(address account) external view returns (bool)",
  "function isResolver(address account) external view returns (bool)",
  
  // Events
  "event MarketCreated(uint256 indexed marketId, address indexed creator, string question, uint256 endTime)",
  "event MarketResolved(uint256 indexed marketId, uint8 winningOutcome)",
  "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
  "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)"
];

export default marketVestaABI;