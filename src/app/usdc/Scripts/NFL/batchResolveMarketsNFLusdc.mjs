import 'dotenv/config';
import { ethers } from 'ethers';
import { readFile } from 'fs/promises';
import { DateTime } from 'luxon';
import fetch from 'node-fetch'; // Ensure node-fetch is installed

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

// Helper: Convert UTC date/time to Chicago date (YYYY-MM-DD)
const convertToLocalDate = (utcDate) => {
  if (!utcDate) {
    console.error("Invalid UTC date provided:", utcDate);
    return null;
  }
  return DateTime.fromISO(utcDate, { zone: 'utc' })
    .setZone('America/Chicago')
    .toISODate(); // Returns YYYY-MM-DD
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

// 1) Fetch all NFL games for the specified date, build a map of gameId -> data
const fetchGamesForDate = async (dateString) => {
  const url = `https://v1.american-football.api-sports.io/games?date=${dateString}`;
  const headers = {
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    "x-rapidapi-host": "v1.american-football.api-sports.io"
  };

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();

    console.log(`Fetched ${data.results} games for date=${dateString}`);

    // Build a lookup map: gameId -> full game object
    const gamesMap = {};
    for (const g of data.response) {
      const gameId = g.game?.id;
      if (gameId) {
        gamesMap[gameId] = g;
      }
    }

    return gamesMap;
  } catch (error) {
    console.error(`Error fetching all games for date=${dateString}:`, error);
    return {};
  }
};

// 2) Load your local market mapping
const loadMappingFile = async () => {
  try {
    const rawData = await readFile(mappingFilePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading mapping file:', error);
    return {};
  }
};

// 3) Main: Resolve markets only for games on "filterDate"
const resolveMarkets = async (filterDate) => {
  // fetch all NFL games for the target date
  const gamesOnDate = await fetchGamesForDate(filterDate);

  // load local market mapping
  const marketMapping = await loadMappingFile();

  // iterate over markets in the local mapping
  for (const [marketId, game] of Object.entries(marketMapping)) {
    // must have a valid game_id
    if (!game || !game.game_id) {
      console.error(`Invalid game mapping for marketId ${marketId}`);
      continue;
    }

    const gameId = game.game_id;

    // check if that gameId is in the map of "games on this date"
    const gameData = gamesOnDate[gameId];
    if (!gameData) {
      // This means the gameId does not belong to a game on filterDate,
      // or the API didn't return it for some reason (not found, etc.)
      console.log(`Skipping marketId ${marketId}: gameId=${gameId} is not on date ${filterDate}`);
      continue;
    }

    // parse the relevant data from gameData
    const statusShort = gameData.game?.status?.short; 
    const homeTotal = gameData.scores?.home?.total;
    const awayTotal = gameData.scores?.away?.total;
    const dateObj = gameData.game?.date;

    if (!statusShort || homeTotal == null || awayTotal == null || !dateObj) {
      console.error(`Skipping marketId ${marketId}: incomplete data from API for gameId=${gameId}`);
      continue;
    }

    // Convert from the "short" code to our universal label
    const status = mapNFLStatus(statusShort);

    // Construct an ISO datetime from the date + time
    // (the API's "date" object has date.timestamp or we can build from date + time)
    // We'll use date.timestamp if available:
    const timestamp = dateObj?.timestamp;
    const startTime = timestamp ? new Date(timestamp * 1000).toISOString() : null;

    // Double check the local date is indeed filterDate
    // (this should be true if the API returned it in that single-date query)
    const localDate = convertToLocalDate(startTime);
    if (localDate !== filterDate) {
      console.log(`Skipping marketId ${marketId}: local date (${localDate}) != filter date (${filterDate}).`);
      continue;
    }

    // Ensure game is completed
    if (status !== "finished") {
      console.log(`Skipping marketId ${marketId}: Game not completed. Status: ${status}`);
      continue;
    }

    // Determine outcome: 0 => away, 1 => home, 2 => draw
    let outcome;
    if (awayTotal > homeTotal) outcome = 0;
    else if (homeTotal > awayTotal) outcome = 1;
    else outcome = 2; // draw

    console.log(`Resolving marketId ${marketId} with outcome ${outcome}`);

    try {
      // call resolveMarket on-chain
      const tx = await contract.resolveMarket(marketId, outcome);
      console.log(`Transaction submitted: ${tx.hash}`);
      await tx.wait();
      console.log(`Market ${marketId} resolved successfully.`);
    } catch (error) {
      console.error(`Error resolving marketId ${marketId}:`, error);
    }
  }
};

// 4) Execute script for a specific local date (e.g. two playoff games on 2025-01-26)
const localDate = "2025-01-26";
resolveMarkets(localDate).catch((error) => console.error('Error resolving markets:', error));