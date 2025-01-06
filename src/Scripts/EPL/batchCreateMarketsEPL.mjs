import 'dotenv/config';
import { ethers } from 'ethers';
import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';

// Contract setup
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.INFURA_URL;
const CONTRACT_ADDRESS = "0x32ce242630c39A94EC24742025d2BE4D380DB8b5"; // Update this if different for EPL
const FULL_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_question", "type": "string" },
      { "internalType": "string[]", "name": "_options", "type": "string[]" },
      { "internalType": "uint256", "name": "_duration", "type": "uint256" }
    ],
    "name": "createMarket",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "marketId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "question", "type": "string" },
      { "indexed": false, "internalType": "string[]", "name": "options", "type": "string[]" },
      { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" }
    ],
    "name": "MarketCreated",
    "type": "event"
  }
];

// Create provider & signer
const provider = new ethers.JsonRpcProvider(INFURA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, FULL_ABI, wallet);

// File paths
const gamesDir = resolve('./src/games/EPL');
const mappingFilePath = resolve('./src/mappings/marketMappingEPL.json');

// Utility: Load and save market mapping
async function loadMarketMapping() {
  try {
    const raw = await readFile(mappingFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveMarketMapping(mappingObject) {
  await writeFile(mappingFilePath, JSON.stringify(mappingObject, null, 2), 'utf-8');
  console.log(`marketMappingEPL.json updated. Total markets in file: ${Object.keys(mappingObject).length}`);
}

// Helper: Create a market on-chain
const createMarketOnChain = async (question, options, duration) => {
  try {
    console.log(`Creating market: "${question}"`);
    const tx = await contract.createMarket(question, options, duration);
    console.log('Transaction submitted:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);

    // Extract marketId from logs
    const relevantLogs = receipt.logs.filter((log) => log.address?.toLowerCase() === contract.target.toLowerCase());
    for (const log of relevantLogs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog.name === "MarketCreated") {
          return Number(parsedLog.args.marketId);
        }
      } catch {}
    }
    return null;
  } catch (error) {
    console.error('Error creating market:', error);
    return null;
  }
};

// Main function: Create markets for EPL games
const createMarketsForFile = async (filename) => {
  try {
    const marketMapping = await loadMarketMapping();
    const filePath = resolve(gamesDir, filename);
    const rawData = await readFile(filePath, 'utf-8');
    const games = JSON.parse(rawData);

    for (const game of games) {
      const { game_id, home_team, away_team, local_date, start_time } = game;

      if (!start_time || isNaN(Date.parse(start_time))) {
        console.log(`Skipping game due to invalid start_time:`, game);
        continue;
      }

      const gameStart = new Date(start_time);
      const now = new Date();
      const duration = Math.floor((gameStart - now) / 1000);

      if (duration <= 0) {
        console.log(`Skipping market for ${away_team} @ ${home_team}: game already started.`);
        continue;
      }

      const question = `${away_team} @ ${home_team} (${local_date})`;
      const options = [away_team, home_team];

      const marketId = await createMarketOnChain(question, options, duration);
      if (marketId !== null) {
        console.log(`Market created for game_id=${game_id} | ID: ${marketId}`);
        marketMapping[marketId] = { game_id, away_team, home_team, local_date };
        await saveMarketMapping(marketMapping);
      }
    }
  } catch (error) {
    console.error(`Error processing file "${filename}":`, error);
  }
};

// Execute script for specific EPL game files
const filesToProcess = ["games-2025-01-06.json"];
filesToProcess.forEach(createMarketsForFile);