import 'dotenv/config';
import { ethers } from 'ethers';
import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';

// ================================
// Contract Setup
// ================================
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.INFURA_URL;
const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5"; // Update if needed

// ABI for the createMarket function and MarketCreated event.
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

// Create provider, wallet, and contract instance.
const provider = new ethers.JsonRpcProvider(INFURA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, FULL_ABI, wallet);

// ================================
// File Paths
// ================================
const gamesDir = resolve('./src/app/vesta/games/CL');
const mappingFilePath = resolve('./src/app/vesta/mappings/marketMappingsCL.json');

// ================================
// Utility: Load and Save Market Mapping
// ================================
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
  console.log(`marketMappingsCL.json updated. Total markets in file: ${Object.keys(mappingObject).length}`);
}

// ================================
// Helper: Create a Market On-Chain
// ================================
const createMarketOnChain = async (question, options, duration) => {
  try {
    console.log(`Creating market: "${question}"`);
    const tx = await contract.createMarket(question, options, duration);
    console.log('Transaction submitted:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);

    // Extract the marketId from the logs.
    const relevantLogs = receipt.logs.filter(
      (log) => log.address?.toLowerCase() === contract.target.toLowerCase()
    );
    for (const log of relevantLogs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog.name === "MarketCreated") {
          return Number(parsedLog.args.marketId);
        }
      } catch {
        // Ignore logs that can't be parsed.
      }
    }
    return null;
  } catch (error) {
    console.error('Error creating market:', error);
    return null;
  }
};

// ================================
// Main Function: Create Markets for CL Games
// ================================
const createMarketsForFile = async (filename) => {
  try {
    const marketMapping = await loadMarketMapping();
    const filePath = resolve(gamesDir, filename);
    const rawData = await readFile(filePath, 'utf-8');
    const games = JSON.parse(rawData);

    for (const game of games) {
      const { game_id, local_date, start_time } = game;
      const homeTeamName = game.home_team.name;
      const awayTeamName = game.away_team.name;

      // Check if a market for this game already exists.
      const existingMarket = Object.values(marketMapping).find(
        (mapping) => mapping.game_id === game_id
      );
      if (existingMarket) {
        console.log(`Market already exists for game_id ${game_id} (${awayTeamName} @ ${homeTeamName}). Skipping.`);
        continue;
      }

      if (!start_time || isNaN(Date.parse(start_time))) {
        console.log(`Skipping game due to invalid start_time:`, game);
        continue;
      }

      // Convert "2025-02-11 17:45:00" to "2025-02-11T17:45:00Z" so it's correctly parsed as UTC.
      const gameStart = new Date(start_time.replace(' ', 'T') + 'Z');
      const now = new Date();
      const duration = Math.floor((gameStart - now) / 1000);

      if (duration <= 0) {
        console.log(`Skipping market for ${awayTeamName} @ ${homeTeamName}: game already started.`);
        continue;
      }

      // Build the market question.
      const question = `${awayTeamName} @ ${homeTeamName} (${local_date})`;
      // Define options: away team (option 0), home team (option 1), and "Draw in regular time" (option 2).
      const options = [awayTeamName, homeTeamName, "Draw in regular time"];

      const marketId = await createMarketOnChain(question, options, duration);
      if (marketId !== null) {
        console.log(`Market created for game_id=${game_id} | Market ID: ${marketId}`);
        // Update the mapping with the new market.
        marketMapping[marketId] = {
          game_id,
          away_team: awayTeamName,
          home_team: homeTeamName,
          local_date
        };
        await saveMarketMapping(marketMapping);
      }
    }
  } catch (error) {
    console.error(`Error processing file "${filename}":`, error);
  }
};

// ================================
// Execute Script for Specific CL Game Files
// ================================
// Get the date from command line arguments or use a default
const targetDate = process.argv[2] || "2025-05-07";
console.log(`Processing games for date: ${targetDate}`);

// The file name can be either directly provided (for backward compatibility)
// or constructed from the target date
const filesToProcess = [targetDate.includes('.json') ? targetDate : `games-${targetDate}.json`];
console.log(`Looking for file: ${filesToProcess[0]}`);

filesToProcess.forEach(createMarketsForFile);