import 'dotenv/config';
import { ethers } from 'ethers';
import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';
import { JsonRpcProvider, Wallet } from 'ethers';

// 1) Environment & Contract Setup
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.INFURA_URL;
const CONTRACT_ADDRESS = "0x5B45E4C00B310f1E9C951e1169C9A60fD856d186";

// 2) Full ABI (Paste your entire contract ABI here)
const FULL_ABI = [
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

// 3) Create provider & signer (Ethers v6)
const provider = new JsonRpcProvider(INFURA_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, FULL_ABI, wallet);

// 4) File paths
const gamesDir = resolve('./src/games/NFL');
// Here's where we store Market <-> Game mapping
const mappingFilePath = resolve('./src/mappings/marketMappingNFL.json');

//-------------------------------------
// Utility: Load / Save Market Mapping
//-------------------------------------
async function loadMarketMapping() {
  try {
    const raw = await readFile(mappingFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    // If file doesn't exist or can't parse, return empty object
    return {};
  }
}

async function saveMarketMapping(mappingObject) {
  // Ensure the directory exists, if needed (optional)
  // For example, if './src/mappings' might not exist, do:
  // await mkdir(resolve('./src/mappings'), { recursive: true });

  await writeFile(mappingFilePath, JSON.stringify(mappingObject, null, 2), 'utf-8');
  console.log(`marketMappingNFL.json updated. Total markets in file: ${Object.keys(mappingObject).length}`);
}

//-------------------------------------
// Helper: Create a market on-chain
//-------------------------------------
const createMarketOnChain = async (question, options, duration) => {
  try {
    console.log(`Creating market: "${question}"`);
    const tx = await contract.createMarket(question, options, duration);
    console.log('Transaction submitted:', tx.hash); // Ethers v6 uses .hash

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash); // Ethers v6 uses .hash

    // Debug: see what logs we actually got
    console.log("Full logs:\n", JSON.stringify(receipt.logs, null, 2));

    // Filter logs by the contract's address
    const relevantLogs = receipt.logs.filter(
      (log) => log.address?.toLowerCase() === contract.target.toLowerCase()
    );

    let marketId = null;

    // Try parsing each relevant log
    for (const log of relevantLogs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog.name === "MarketCreated") {
          // event MarketCreated(uint256 marketId, string question, string[] options, uint256 endTime)
          marketId = Number(parsedLog.args.marketId);
          console.log(`MarketCreated => marketId = ${marketId}`);
          break;
        }
      } catch (err) {
        // ignore if it's not a recognized event
      }
    }

    if (marketId === null) {
      console.error("MarketCreated event not found in logs. Possibly reverted or event signature mismatch.");
      return null;
    }

    return marketId;
  } catch (error) {
    console.error('Error creating market:', error);
    return null;
  }
};

//-------------------------------------
// Main function to create markets from a given games JSON file
//-------------------------------------
const createMarketsForFile = async (filename) => {
  try {
    // Load existing mapping file so we can append new markets
    const marketMapping = await loadMarketMapping();

    const filePath = resolve(gamesDir, filename);
    const rawData = await readFile(filePath, 'utf-8');
    const games = JSON.parse(rawData);

    for (const game of games) {
      const {
        game_id,
        home_team,
        away_team,
        local_date,
        start_time
      } = game;
    
      // Validate `start_time`
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
        marketMapping[marketId] = {
          game_id,
          away_team,
          home_team,
          local_date
        };
    
        await saveMarketMapping(marketMapping);
      }
    }
    
  } catch (error) {
    console.error(`Error processing file "${filename}":`, error);
  }
};

//-------------------------------------
// Execute script for specific game file(s)
//-------------------------------------
const filesToProcess = ["games-2025-01-18.json"];
filesToProcess.forEach(createMarketsForFile);