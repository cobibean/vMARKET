import 'dotenv/config';
import { ethers } from 'ethers';
import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';
import { JsonRpcProvider, Wallet } from 'ethers';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = process.env.INFURA_URL;
const CONTRACT_ADDRESS = "0x2A1967EDCD3863d54192B9f08bCd1fD5577b0D4b";
const ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_question", "type": "string" },
      { "internalType": "string[]", "name": "_options", "type": "string[]" },
      { "internalType": "uint256", "name": "_duration", "type": "uint256" }
    ],
    "name": "createMarket",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "marketCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];


const provider = new JsonRpcProvider(INFURA_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

const gamesDir = resolve('./src/games');

const createMarket = async (question, options, duration) => {
    try {
        console.log(`Creating market: ${question}`);
        const tx = await contract.createMarket(question, options, duration);
        console.log('Transaction submitted:', tx.hash);

        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt.transactionHash);

        const marketId = receipt.events.find(event => event.event === 'MarketCreated').args.marketId.toNumber();
        console.log(`Market created with ID: ${marketId}`);
        return marketId;
    } catch (error) {
        console.error('Error creating market:', error);
        return null;
    }
};

const createMarketsForFile = async (filename) => {
    try {
        const filePath = resolve(gamesDir, filename);
        const games = JSON.parse(await readFile(filePath, 'utf-8'));

        for (const game of games) {
            const { home_team, away_team, local_date, start_time } = game;

            // Parse and validate start_time
            if (!start_time || isNaN(Date.parse(start_time))) {
                console.log(`Skipping market for ${away_team} @ ${home_team}: Invalid start_time.`);
                continue;
            }

            const gameStart = new Date(start_time);

            // Calculate the duration in seconds
            const now = new Date();
            const duration = Math.floor((gameStart - now) / 1000);

            if (isNaN(duration) || duration <= 0) {
                console.log(`Skipping market for ${away_team} @ ${home_team}: Invalid duration or game already started.`);
                continue;
            }

            console.log(`Game Start (UTC): ${gameStart}`);
            console.log(`Now: ${now}`);
            console.log(`Duration in seconds: ${duration}`);

            const question = `${away_team} @ ${home_team} (${local_date})`;
            const options = [away_team, home_team];

            console.log(`Processing: ${question}`);

            await createMarket(question, options, duration);
        }
    } catch (error) {
        console.error(`Error processing file ${filename}:`, error);
    }
};

// Specify the file(s) to process
const filesToProcess = ["games-2025-01-02.json"]; // Add filenames here
filesToProcess.forEach(createMarketsForFile);
