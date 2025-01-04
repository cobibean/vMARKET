import 'dotenv/config';
import { ethers } from 'ethers';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.INFURA_URL;
const CONTRACT_ADDRESS = "0x32ce242630c39A94EC24742025d2BE4D380DB8b5";
const ABI = [
  {
    "inputs": [],
    "name": "marketCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "markets",
    "outputs": [
      { "internalType": "string", "name": "question", "type": "string" },
      { "internalType": "uint256", "name": "endTime", "type": "uint256" },
      { "internalType": "uint8", "name": "outcome", "type": "uint8" },
      { "internalType": "bool", "name": "resolved", "type": "bool" },
      { "internalType": "bool", "name": "refunded", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const provider = new ethers.JsonRpcProvider(INFURA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

const outputFile = resolve('./unresolved_markets.json');

const fetchUnresolvedMarkets = async () => {
  try {
    console.log('Fetching total market count...');
    const marketCount = await contract.marketCount();
    console.log(`Total markets: ${marketCount.toString()}`);

    const unresolvedMarkets = [];

    for (let i = 0; i < Number(marketCount); i++) {
      const market = await contract.markets(i);
      const { question, endTime, outcome, resolved } = market;

      if (!resolved) {
        unresolvedMarkets.push({
          marketId: i,
          question,
          endTime: new Date(Number(endTime) * 1000).toISOString(), // Convert BigInt to Number
          outcome: Number(outcome), // Convert BigInt to Number
          resolved
        });
      }
    }

    console.log(`Found ${unresolvedMarkets.length} unresolved markets.`);
    await writeFile(outputFile, JSON.stringify(unresolvedMarkets, null, 2), 'utf-8');
    console.log(`Unresolved markets saved to ${outputFile}`);
  } catch (error) {
    console.error('Error fetching unresolved markets:', error);
  }
};

// Execute the script
fetchUnresolvedMarkets();