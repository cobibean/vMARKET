import { ethers } from 'ethers';
import 'dotenv/config';

// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.INFURA_URL;

if (!PRIVATE_KEY || !INFURA_URL) {
  console.error("Error: PRIVATE_KEY or INFURA_URL is not set in the .env file.");
  process.exit(1);
}

(async () => {
  try {
    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Test connection by fetching the current block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`Connected to the blockchain! Current block number: ${blockNumber}`);

    // Test the wallet address
    console.log(`Wallet address: ${wallet.address}`);
  } catch (error) {
    console.error("Error connecting to the blockchain:", error);
  }
})();