import 'dotenv/config';
import { ethers } from 'ethers';
import { readFile } from 'fs/promises';
import { DateTime } from 'luxon';
import fetch from 'node-fetch'; // Ensure you have node-fetch installed

// Contract setup
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.INFURA_URL;
const CONTRACT_ADDRESS = "0x5B45E4C00B310f1E9C951e1169C9A60fD856d186"; 
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
const mappingFilePath = './src/app/usdc/mappings/marketMappingNFL.json';

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

// Helper: Map NFL-specific status codes to universal labels
const mapNFLStatus = (status) => {
  switch (status) {
    case "NS": return "scheduled";
    case "Q1":
    case "Q2":
    case "Q3":
    case "Q4":
    case "OT":
    case "HT": return "in progress";
    case "FT":
    case "AOT": return "finished";
    case "CANC": return "cancelled";
    case "PST": return "postponed";
    default: return "unknown";
  }
};

// Fetch game details from the NFL API
const fetchGameDetails = async (gameId) => {
    const url = `https://v1.american-football.api-sports.io/games?id=${gameId}`; 
    const headers = {
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      "x-rapidapi-host": "v1.american-football.api-sports.io"
    };
  
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
  
      // Get the first game from the response (assuming a single game per ID)
      const game = data.response[0]?.game;
      const scores = data.response[0]?.scores;
  
      if (!game || !scores) {
        console.error(`No game or scores data found for gameId=${gameId}`);
        return null;
      }
  
      return {
        homeScore: scores.home.total, // Total home score
        awayScore: scores.away.total, // Total away score
        status: mapNFLStatus(game.status.short), // Mapped status
        startTime: new Date(game.date.timestamp * 1000).toISOString() // Convert UNIX to ISO string
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
      if (status !== "finished") {
        console.log(`Skipping marketId ${marketId}: Game not completed. Status: ${status}`);
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
  const localDate = "2025-01-18"; // Replace with desired date
  resolveMarkets(localDate).catch((error) => console.error('Error resolving markets:', error));