import "dotenv/config";
import { ethers } from "ethers";
import { promises as fs } from "fs";
import moment from "moment-timezone";

// 1) Environment & Contract Setup
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.INFURA_URL;
const CONTRACT_ADDRESS = "0x5B45E4C00B310f1E9C951e1169C9A60fD856d186";

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

// 3) Create provider, wallet, and contract instance
const provider = new ethers.JsonRpcProvider(INFURA_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, FULL_ABI, wallet);

// 4) Path to `rules.json`
const rulesPath = "/Users/cobibean/DEV/vMARKET/vMARKETbuild/vmarket/public/rules.json";

// 5) Validate Inputs and Parse CLI Arguments
const question = process.argv[2];
const optionsInput = process.argv[3];
const endTimeInput = process.argv[4];
const rule = process.argv[5];
const room = process.argv[6];

if (!question || !optionsInput || !endTimeInput || !rule || !room) {
  console.error(
    "Usage: node createMarket.js <question> <options> <endTime> <rule> <room>\n" +
      'Example: node createMarket.js "Will TikTok be banned?" \'["Yes", "No"]\' "2025-05-01 14:00" "Market resolves as Yes if TikTok is banned before May 2025." "vesta"'
  );
  process.exit(1);
}

// Validate `room` input
if (!["vesta", "usdc"].includes(room)) {
  console.error('Invalid room value. Use "vesta" or "usdc".');
  process.exit(1);
}

// Parse options
let options;
try {
  options = JSON.parse(optionsInput);
  if (!Array.isArray(options) || options.length < 2) {
    throw new Error("Options must be a JSON array with at least two items.");
  }
} catch (error) {
  console.error("Invalid options format. Use a JSON array, e.g., ['Yes', 'No']");
  process.exit(1);
}


let duration; // Declare the variable

// If `endTimeInput` is already a duration in seconds:
if (/^\d+$/.test(endTimeInput)) {
  duration = parseInt(endTimeInput, 10); // Use the provided duration directly
} else {
  // If `endTimeInput` is a date/time string, calculate the duration
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const parsedTime = moment.tz(endTimeInput, "YYYY-MM-DD HH:mm", "America/Chicago");
  if (!parsedTime.isValid()) {
    console.error("Invalid end time. Use format: YYYY-MM-DD HH:mm or a valid Unix timestamp.");
    process.exit(1);
  }
  duration = parsedTime.unix() - now; // Calculate the duration in seconds
}

if (duration <= 0) {
  console.error("End time must be in the future.");
  process.exit(1);
}

// 6) Create Market Function
async function createMarket() {
  try {
    console.log("Creating market with the following details:");
    console.log(`Question: ${question}`);
    console.log(`Options: ${JSON.stringify(options)}`);
    console.log(`Duration (in seconds): ${duration}`);
    console.log(`Rule: ${rule}`);
    console.log(`Room: ${room}`);

    // Interact with the blockchain
    const tx = await contract.createMarket(question, options, duration);
    console.log("Transaction submitted. Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.transactionHash);

    // Extract marketId from logs
    const event = receipt.logs.find((log) =>
      log.topics[0] === ethers.id("MarketCreated(uint256,string,string[],uint256)")
    );
    const marketId = event ? parseInt(event.topics[1], 16) : null;

    if (!marketId) {
      console.error("Market ID not found in transaction logs.");
      return;
    }

    console.log("Market created with ID:", marketId);

    // 7) Append to `rules.json`
    const newRule = { marketId, room, question, rule };
    let existingRules = [];

    // Handle `rules.json` read/write
    try {
      const fileContent = await fs.readFile(rulesPath, "utf8");
      existingRules = fileContent.trim() ? JSON.parse(fileContent) : [];
    } catch (error) {
      console.warn("Failed to read rules.json. Initializing as empty:", error);
      existingRules = [];
    }

    // Add the new rule and write back to `rules.json`
    existingRules.push(newRule);

    await fs.writeFile(rulesPath, JSON.stringify(existingRules, null, 2), "utf8");
    console.log("Rule successfully written to rules.json:", newRule);
  } catch (error) {
    console.error("Error creating market:", error);
  }
}

// 8) Execute the function
createMarket();



