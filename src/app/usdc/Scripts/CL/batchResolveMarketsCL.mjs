import 'dotenv/config';
import { ethers } from 'ethers';
import { readFile } from 'fs/promises';
import { DateTime } from 'luxon';
import fetch from 'node-fetch';
import { resolve } from 'path';

// ================================
// Contract Setup
// ================================
// Replace CONTRACT_ADDRESS and ABI with your actual CL contract details.
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.INFURA_URL;
const CONTRACT_ADDRESS = "0x5B45E4C00B310f1E9C951e1169C9A60fD856d186"; // Update if needed

// Ensure your ABI includes the resolveMarket function.
const ABI = [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_bettingToken",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "_feeRecipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_feePercentage",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "OwnableUnauthorized",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "marketId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "Claimed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "marketId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "question",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string[]",
              "name": "options",
              "type": "string[]"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            }
          ],
          "name": "MarketCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "marketId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint8",
              "name": "outcome",
              "type": "uint8"
            }
          ],
          "name": "MarketResolved",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "prevOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnerUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "marketId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "optionIndex",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "SharesPurchased",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "bettingToken",
          "outputs": [
            {
              "internalType": "contract IERC20",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_marketId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_optionIndex",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_amount",
              "type": "uint256"
            }
          ],
          "name": "buyShares",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_marketId",
              "type": "uint256"
            }
          ],
          "name": "claimWinnings",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "_question",
              "type": "string"
            },
            {
              "internalType": "string[]",
              "name": "_options",
              "type": "string[]"
            },
            {
              "internalType": "uint256",
              "name": "_duration",
              "type": "uint256"
            }
          ],
          "name": "createMarket",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "feePercentage",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "feeRecipient",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_marketId",
              "type": "uint256"
            }
          ],
          "name": "getMarketInfo",
          "outputs": [
            {
              "internalType": "string",
              "name": "question",
              "type": "string"
            },
            {
              "internalType": "string[3]",
              "name": "options",
              "type": "string[3]"
            },
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "outcome",
              "type": "uint8"
            },
            {
              "internalType": "uint256[3]",
              "name": "totalShares",
              "type": "uint256[3]"
            },
            {
              "internalType": "bool",
              "name": "resolved",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_marketId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "_user",
              "type": "address"
            }
          ],
          "name": "getSharesBalance",
          "outputs": [
            {
              "internalType": "uint256[3]",
              "name": "sharesBalance",
              "type": "uint256[3]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "marketCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "markets",
          "outputs": [
            {
              "internalType": "string",
              "name": "question",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "endTime",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "outcome",
              "type": "uint8"
            },
            {
              "internalType": "bool",
              "name": "resolved",
              "type": "bool"
            },
            {
              "internalType": "bool",
              "name": "refunded",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_marketId",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "_outcome",
              "type": "uint8"
            }
          ],
          "name": "resolveMarket",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_feePercentage",
              "type": "uint256"
            }
          ],
          "name": "setFeePercentage",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_feeRecipient",
              "type": "address"
            }
          ],
          "name": "setFeeRecipient",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_newOwner",
              "type": "address"
            }
          ],
          "name": "setOwner",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
];

const provider = new ethers.JsonRpcProvider(INFURA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// ================================
// File Paths
// ================================
// Mapping file for CL markets (entries like { marketId: { game_id, away_team, home_team, local_date } })
const mappingFilePath = resolve('./src/app/usdc/mappings/marketMappingsCL.json');

// ================================
// SportMonks API Setup
// ================================
const SPORTMONKS_API_TOKEN = 'YTTir99m6yR9GVRoC8AXsjs1m4UxrAkVzrwWUlZ0rBljLX0r1b9yeksCzTfj';
// To fetch a fixture's details including scores:
const getFixtureUrl = (gameId) =>
  `https://api.sportmonks.com/v3/football/fixtures/${gameId}?api_token=${SPORTMONKS_API_TOKEN}&include=scores`;

// ================================
// Helpers
// ================================

// Convert a UTC date string (e.g. "2025-02-11 17:45:00") to local date (Chicago, YYYY-MM-DD)
const convertToLocalDate = (utcDateStr) => {
  if (!utcDateStr) {
    console.error("Invalid UTC date provided:", utcDateStr);
    return null;
  }
  // Convert "YYYY-MM-DD HH:MM:SS" to ISO format "YYYY-MM-DDTHH:MM:SSZ"
  const isoStr = utcDateStr.replace(' ', 'T') + 'Z';
  return DateTime.fromISO(isoStr, { zone: 'utc' })
    .setZone('America/Chicago')
    .toISODate();
};

// Load the market mapping JSON file.
const loadMarketMapping = async () => {
  try {
    const rawData = await readFile(mappingFilePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading mapping file:', error);
    return {};
  }
};

// Fetch game details for a given gameId from SportMonks.
const fetchGameDetails = async (gameId) => {
  const url = getFixtureUrl(gameId);
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.data) {
      console.error(`No data returned for gameId=${gameId}`);
      return null;
    }
    const fixture = data.data;

    // Use the "CURRENT" scores as they appear to represent the final score.
    const currentScores = fixture.scores.filter(score => score.description === "CURRENT");

    if (currentScores.length === 0) {
      console.error(`No "CURRENT" scores found for gameId=${gameId}. The game might not be finished.`);
      return null;
    }

    const homeScoreObj = currentScores.find(s => s.score.participant.toLowerCase() === "home");
    const awayScoreObj = currentScores.find(s => s.score.participant.toLowerCase() === "away");

    if (!homeScoreObj || !awayScoreObj) {
      console.error(`Incomplete score data for gameId=${gameId}.`);
      return null;
    }

    console.log(`Fetched scores for gameId ${gameId}: Home = ${homeScoreObj.score.goals}, Away = ${awayScoreObj.score.goals}`);

    return {
      homeScore: homeScoreObj.score.goals,
      awayScore: awayScoreObj.score.goals,
      startTime: fixture.starting_at // e.g., "2025-02-11 17:45:00"
    };
  } catch (error) {
    console.error(`Error fetching details for game ${gameId}:`, error);
    return null;
  }
};

// ================================
// Main: Resolve CL Markets
// ================================
const resolveMarkets = async (filterDate) => {
  const marketMapping = await loadMarketMapping();

  for (const [marketId, game] of Object.entries(marketMapping)) {
    if (!game || !game.game_id) {
      console.error(`Invalid game mapping for marketId ${marketId}`);
      continue;
    }

    // Fetch game details using the game_id from the mapping.
    const gameDetails = await fetchGameDetails(game.game_id);
    if (!gameDetails) {
      console.error(`Skipping marketId ${marketId}: Unable to fetch game details.`);
      continue;
    }

    const { homeScore, awayScore, startTime } = gameDetails;

    // Convert the fixture's start time to local date.
    const localDate = convertToLocalDate(startTime);
    if (localDate !== filterDate) {
      console.log(`Skipping marketId ${marketId}: Local date (${localDate}) does not match filter (${filterDate}).`);
      continue;
    }

    // If scores are not available (i.e. one is null), skip.
    if (homeScore === null || awayScore === null) {
      console.log(`Skipping marketId ${marketId}: Scores not available yet.`);
      continue;
    }

    // Determine outcome: 0 for away win, 1 for home win, 2 for draw.
    let outcome;
    if (awayScore > homeScore) outcome = 0;
    else if (homeScore > awayScore) outcome = 1;
    else outcome = 2;

    console.log(`Resolving marketId ${marketId} with outcome ${outcome} (Away: ${awayScore}, Home: ${homeScore})`);

    try {
      // Call resolveMarket on-chain.
      const tx = await contract.resolveMarket(marketId, outcome);
      console.log(`Transaction submitted: ${tx.hash}`);
      await tx.wait();
      console.log(`Market ${marketId} resolved successfully.`);
    } catch (error) {
      console.error(`Error resolving marketId ${marketId}:`, error);
    }
  }
};

// ================================
// Execute Script
// ================================

// Set the filter date (in local Chicago time, "YYYY-MM-DD") for which you want to resolve markets.
const filterDate = "2025-02-18"; // Replace with your desired date.
resolveMarkets(filterDate).catch((error) => console.error('Error resolving markets:', error));