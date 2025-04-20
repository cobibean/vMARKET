import { ethers } from 'ethers';
import marketVestaFullABI from '../constants/marketVestaFullABI';

// Contract address for Metis L2
export const CONTRACT_ADDRESS = '0x949865114535dA93823bf5515608406325b40Fc5';

// Market states
export enum MarketState {
  OPEN = 0,
  RESOLVED = 1,
  CANCELED = 2
}

// Helper function to get provider
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to RPC URL
  return new ethers.JsonRpcProvider('https://sepolia.metisdevops.link');
};

// Get contract instance (read-only)
export const getContract = () => {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, marketVestaFullABI, provider);
};

// Get contract with signer for write operations
export const getSignedContract = async () => {
  const provider = getProvider();
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, marketVestaFullABI, signer);
};

// Get all markets
export const getAllMarkets = async () => {
  try {
    const contract = getContract();
    const marketCount = await contract.getMarketCount();
    
    const markets = [];
    for (let i = 0; i < marketCount; i++) {
      const market = await contract.markets(i);
      markets.push({
        id: i,
        creator: market.creator,
        resolver: market.resolver,
        question: market.question,
        outcomes: market.outcomes,
        endTime: market.endTime,
        state: market.state
      });
    }
    
    return markets;
  } catch (error) {
    console.error('Error fetching markets:', error);
    throw error;
  }
};

// Create a new market
export const createMarket = async (question: string, outcomes: string[], endTime: number) => {
  try {
    const contract = await getSignedContract();
    const tx = await contract.createMarket(question, outcomes, endTime);
    return await tx.wait();
  } catch (error) {
    console.error('Error creating market:', error);
    throw error;
  }
};

// Resolve a market
export const resolveMarket = async (marketId: number, winningOutcome: number) => {
  try {
    const contract = await getSignedContract();
    const tx = await contract.resolveMarket(marketId, winningOutcome);
    return await tx.wait();
  } catch (error) {
    console.error('Error resolving market:', error);
    throw error;
  }
};

// Check if address is an admin
export const isAdmin = async (address: string) => {
  try {
    console.log('Checking admin status for address:', address);
    console.log('Using contract address:', CONTRACT_ADDRESS);
    
    const contract = getContract();
    
    // Get the DEFAULT_ADMIN_ROLE constant from the contract
    const defaultAdminRole = await contract.DEFAULT_ADMIN_ROLE();
    console.log('Default admin role:', defaultAdminRole);
    
    // Check if the address has the admin role
    const hasAdminRole = await contract.hasRole(defaultAdminRole, address);
    console.log('Admin status via hasRole:', hasAdminRole);
    
    return hasAdminRole;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Check if address is a resolver
export const isResolver = async (address: string) => {
  try {
    const contract = getContract();
    return await contract.isResolver(address);
  } catch (error) {
    console.error('Error checking resolver status:', error);
    return false;
  }
};

// Add an admin
export const addAdmin = async (address: string) => {
  try {
    const contract = await getSignedContract();
    const tx = await contract.addAdmin(address);
    return await tx.wait();
  } catch (error) {
    console.error('Error adding admin:', error);
    throw error;
  }
};

// Remove an admin
export const removeAdmin = async (address: string) => {
  try {
    const contract = await getSignedContract();
    const tx = await contract.removeAdmin(address);
    return await tx.wait();
  } catch (error) {
    console.error('Error removing admin:', error);
    throw error;
  }
};

// Add a resolver
export const addResolver = async (address: string) => {
  try {
    const contract = await getSignedContract();
    const tx = await contract.addResolver(address);
    return await tx.wait();
  } catch (error) {
    console.error('Error adding resolver:', error);
    throw error;
  }
};

// Remove a resolver
export const removeResolver = async (address: string) => {
  try {
    const contract = await getSignedContract();
    const tx = await contract.removeResolver(address);
    return await tx.wait();
  } catch (error) {
    console.error('Error removing resolver:', error);
    throw error;
  }
}; 