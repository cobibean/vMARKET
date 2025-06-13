import "dotenv/config";
import { ethers } from "ethers";

// Constants
export const CONTRACT_ADDRESSES = {
  vesta: process.env.VESTA_CONTRACT_ADDRESS || "0x949865114535dA93823bf5515608406325b40Fc5",
  usdc: process.env.USDC_CONTRACT_ADDRESS || "0x5B45E4C00B310f1E9C951e1169C9A60fD856d186"
};

// Import full contract ABIs
export const VESTA_CONTRACT_ABI = [
  // ABI content will be moved to a centralized location in a later step
  // Using the ABI from createMarketVesta.js for now
];

export const USDC_CONTRACT_ABI = [
  // ABI content will be moved to a centralized location in a later step
  // Using the ABI from createMarketUsdc.mjs for now
];

// Provider setup
export function getProvider() {
  return new ethers.JsonRpcProvider(process.env.INFURA_URL || "https://sepolia.metisdevops.link");
}

// Get contract with signer
export function getSignedContract(contractType = 'vesta') {
  const provider = getProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  if (contractType === 'vesta') {
    return new ethers.Contract(CONTRACT_ADDRESSES.vesta, VESTA_CONTRACT_ABI, wallet);
  } else if (contractType === 'usdc') {
    return new ethers.Contract(CONTRACT_ADDRESSES.usdc, USDC_CONTRACT_ABI, wallet);
  } else {
    throw new Error(`Invalid contract type: ${contractType}`);
  }
} 