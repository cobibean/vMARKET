import { getSignedContract } from "./utils/contractConfig.js";
import { parseOptions, parseEndTime, saveRule } from "./utils/marketUtils.js";
import { ethers } from "ethers";

// Process command line arguments
const [,, question, optionsInput, endTimeInput, rule, room = 'usdc'] = process.argv;

if (!question || !optionsInput || !endTimeInput || !rule) {
  console.error(
    "Usage: node createMarketUsdc_refactored.mjs <question> <options> <endTime> <rule> [room]\n" +
    'Example: node createMarketUsdc_refactored.mjs "Who will win the election?" \'["Candidate A", "Candidate B", "Candidate C"]\' "2024-11-05 23:59" "Market resolves based on official election results." "usdc"'
  );
  process.exit(1);
}

// Validate `room` input
if (!["vesta", "usdc"].includes(room)) {
  console.error('Invalid room value. Use "vesta" or "usdc".');
  process.exit(1);
}

async function createMarket() {
  try {
    // Parse inputs
    const options = parseOptions(optionsInput);
    const duration = parseEndTime(endTimeInput);
    
    if (duration <= 0) {
      console.error("End time must be in the future.");
      process.exit(1);
    }
    
    console.log("Creating market with the following details:");
    console.log(`Question: ${question}`);
    console.log(`Options: ${JSON.stringify(options)}`);
    console.log(`Duration (in seconds): ${duration}`);
    console.log(`Rule: ${rule}`);
    console.log(`Room: ${room}`);
    
    // Get contract and create market
    const contract = getSignedContract(room);
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
    
    // Save rule
    const ruleAdded = await saveRule(marketId, question, rule, room);
    if (ruleAdded) {
      console.log("Rule successfully written to rules.json");
    } else {
      console.error("Failed to write rule to rules.json");
    }
    
  } catch (error) {
    console.error("Error creating market:", error);
    process.exit(1);
  }
}

createMarket(); 