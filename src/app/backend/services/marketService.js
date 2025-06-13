import { getSignedContract } from "../utils/contractConfig.js";
import { parseOptions, parseEndTime, saveRule } from "../utils/marketUtils.js";
import { ethers } from "ethers";

// Create market function that can be used by both CLI and API
export async function createMarketService(question, options, endTime, rule, room = 'vesta') {
  try {
    let parsedOptions, duration;
    
    // Handle different input types (API might send objects, CLI sends strings)
    if (typeof options === 'string') {
      parsedOptions = parseOptions(options);
    } else if (Array.isArray(options)) {
      parsedOptions = options;
    } else {
      throw new Error("Invalid options format");
    }
    
    // Handle different endTime formats
    if (typeof endTime === 'string') {
      duration = parseEndTime(endTime);
    } else if (typeof endTime === 'number') {
      duration = endTime;
    } else {
      throw new Error("Invalid endTime format");
    }
    
    if (duration <= 0) {
      throw new Error("End time must be in the future");
    }
    
    // Create the market
    const contract = getSignedContract(room);
    const tx = await contract.createMarket(question, parsedOptions, duration);
    const receipt = await tx.wait();
    
    // Extract marketId
    const event = receipt.logs.find((log) =>
      log.topics[0] === ethers.id("MarketCreated(uint256,string,string[],uint256)")
    );
    const marketId = event ? parseInt(event.topics[1], 16) : null;
    
    if (!marketId) {
      throw new Error("Market ID not found in transaction logs");
    }
    
    // Save rule
    await saveRule(marketId, question, rule, room);
    
    return {
      success: true,
      marketId,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Error in market service:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get markets function with optional filtering
export async function getMarketsService(state = undefined) {
  try {
    const vestaContract = getSignedContract('vesta');
    const usdcContract = getSignedContract('usdc');
    
    const marketCount = await vestaContract.marketCount();
    const markets = [];
    
    // Fetch all markets
    for (let i = 1; i <= marketCount; i++) {
      try {
        const marketInfo = await vestaContract.getMarketInfo(i);
        
        const market = {
          id: i,
          question: marketInfo.question,
          outcomes: marketInfo.options,
          endTime: Number(marketInfo.endTime),
          state: marketInfo.resolved ? 1 : 0, // 0 = open, 1 = resolved
          totalShares: marketInfo.totalShares.map(share => Number(share))
        };
        
        // Filter by state if provided
        if (state === undefined || market.state === state) {
          markets.push(market);
        }
      } catch (err) {
        console.warn(`Error fetching market ${i}:`, err.message);
      }
    }
    
    return markets;
  } catch (error) {
    console.error("Error fetching markets:", error);
    throw error;
  }
}

// Resolve market function
export async function resolveMarketService(marketId, outcome, room = 'vesta') {
  try {
    const contract = getSignedContract(room);
    const tx = await contract.resolveMarket(marketId, outcome);
    const receipt = await tx.wait();
    
    return {
      success: true,
      marketId,
      outcome,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Error resolving market:", error);
    return {
      success: false,
      error: error.message
    };
  }
} 