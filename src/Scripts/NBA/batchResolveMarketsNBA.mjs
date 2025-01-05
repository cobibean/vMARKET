import 'dotenv/config';
import { ethers } from 'ethers';
import { readFile } from 'fs/promises';
import { DateTime } from 'luxon';

// Contract setup
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.INFURA_URL;
const CONTRACT_ADDRESS = "0x32ce242630c39A94EC24742025d2BE4D380DB8b5";
const ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "_marketId", "type": "uint256" },
      { "internalType": "uint8", "name": "_outcome", "type": "uint8" }
    ],
    "name": "resolveMarket",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const provider = new ethers.JsonRpcProvider(INFURA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// File paths
const mappingFilePath = './src/mappings/marketMappingNBA.json';

// Helper: Convert UTC to Chicago local date
const convertToLocalDate = (utcDate) => {
  if (!utcDate) {
    console.error("Invalid UTC date provided:", utcDate);
    return null;
  }
  return DateTime.fromISO(utcDate, { zone: 'utc' })
    .setZone('America/Chicago')
    .toISODate(); // Returns YYYY-MM-DD
};

// Helper: Load mapping file
const loadMappingFile = async () => {
  try {
    const rawData = await readFile(mappingFilePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading mapping file:', error);
    return {};
  }
};

// Fetch game details from the API
const fetchGameDetails = async (gameId) => {
  const url = `https://v2.nba.api-sports.io/games?id=${gameId}`;
  const headers = {
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    "x-rapidapi-host": "v2.nba.api-sports.io"
  };

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    const game = data.response[0];
    return {
      homeScore: game.scores.home.points,
      awayScore: game.scores.visitors.points,
      status: game.status.short, // Status code (1 = scheduled, 2 = in play, 3 = complete)
      startTime: game.date.start // ISO UTC datetime string
    };
  } catch (error) {
    console.error(`Error fetching details for game ${gameId}:`, error);
    return null;
  }
};

// Main: Resolve markets
const resolveMarkets = async (filterDate) => {
  const marketMapping = await loadMappingFile();

  for (const [marketId, game] of Object.entries(marketMapping)) {
    if (!game || !game.game_id) {
      console.error(`Invalid game mapping for marketId ${marketId}`);
      continue;
    }

    // Fetch game details
    const gameDetails = await fetchGameDetails(game.game_id);
    if (!gameDetails) {
      console.error(`Skipping marketId ${marketId}: Unable to fetch game details.`);
      continue;
    }

    const { homeScore, awayScore, status, startTime } = gameDetails;

    // Calculate local date from startTime
    const localDate = convertToLocalDate(startTime);

    // Skip games that don't match the filter date
    if (localDate !== filterDate) {
      console.log(`Skipping marketId ${marketId}: Local date (${localDate}) does not match filter (${filterDate}).`);
      continue;
    }

    // Ensure the game is completed
    if (status !== 3) {
      console.log(`Skipping marketId ${marketId}: Game not completed. Status code: ${status}`);
      continue;
    }

    // Determine outcome
    let outcome;
    if (awayScore > homeScore) outcome = 0; // Away win
    else if (homeScore > awayScore) outcome = 1; // Home win
    else outcome = 2; // Draw

    console.log(`Resolving marketId ${marketId} with outcome ${outcome}`);

    try {
      // Call resolveMarket on-chain
      const tx = await contract.resolveMarket(marketId, outcome);
      console.log(`Transaction submitted: ${tx.hash}`);
      await tx.wait();
      console.log(`Market ${marketId} resolved successfully.`);
    } catch (error) {
      console.error(`Error resolving marketId ${marketId}:`, error);
    }
  }
};

// Execute script for specific local date
const localDate = "2025-01-04"; // Replace with desired date
resolveMarkets(localDate).catch((error) => console.error('Error resolving markets:', error));