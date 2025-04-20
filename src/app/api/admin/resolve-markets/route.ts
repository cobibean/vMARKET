import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ethers } from 'ethers';
import marketVestaABI from '../../../vesta/constants/marketVestaABI';

// Contract address
const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5";

// Market resolution requires private key
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const INFURA_URL = process.env.INFURA_URL || 'https://andromeda.metis.io/?owner=1088';

// SportMonks API configuration
const API_TOKEN = process.env.SPORTMONKS_API_TOKEN || '';
const SPORTMONKS_API_BASE = 'https://api.sportmonks.com/v3/football/fixtures/';

interface Score {
  description: string;
  score: {
    participant: string;
    goals: number;
  };
}

// Function to verify if user has the required role
async function verifyRole(address: string, requiredRole: string) {
  try {
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, provider);
    
    let roleBytes32;
    if (requiredRole === 'creator') {
      roleBytes32 = await contract.MARKET_CREATOR_ROLE();
    } else if (requiredRole === 'resolver') {
      roleBytes32 = await contract.MARKET_RESOLVER_ROLE();
    } else {
      roleBytes32 = await contract.DEFAULT_ADMIN_ROLE();
    }
    
    const hasRole = await contract.hasRole(roleBytes32, address);
    return hasRole;
  } catch (error) {
    console.error('Error verifying role:', error);
    return false;
  }
}

// Fetch unresolved markets for a specific date
async function fetchMarketsForDate(date: string) {
  try {
    // Find all markets with end_time that matches the given date
    // First convert date to timestamp range for that day
    const dateObj = new Date(date);
    const startOfDay = Math.floor(new Date(dateObj.setHours(0, 0, 0, 0)).getTime() / 1000);
    const endOfDay = Math.floor(new Date(dateObj.setHours(23, 59, 59, 999)).getTime() / 1000);
    
    const result = await sql`
      SELECT m.*, g.data as game_data
      FROM markets m
      JOIN games g ON m.game_id = g.game_id
      WHERE 
        m.end_time BETWEEN ${startOfDay} AND ${endOfDay}
      ORDER BY m.market_id ASC
    `;
    
    return result.rows.map(row => ({
      marketId: row.market_id,
      gameId: row.game_id,
      league: row.league,
      question: row.question,
      options: row.options,
      endTime: row.end_time,
      game: row.game_data
    }));
  } catch (error) {
    console.error(`Error fetching markets for date ${date}:`, error);
    throw error;
  }
}

// Check if a market is already resolved on-chain
async function isMarketResolved(marketId: string) {
  try {
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, provider);
    
    const marketInfo = await contract.getMarketInfo(marketId);
    return marketInfo.resolved;
  } catch (error) {
    console.error(`Error checking if market ${marketId} is resolved:`, error);
    return false;
  }
}

// Fetch game result from SportMonks API
async function fetchGameResult(gameId: string) {
  try {
    const url = `${SPORTMONKS_API_BASE}${gameId}?api_token=${API_TOKEN}&include=scores`;
    console.log(`Fetching game result from: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
    }
    
    const data = await response.json();
    
    if (!data.data) {
      throw new Error('No data returned for game');
    }
    
    const fixture = data.data;
    
    // Use the "CURRENT" scores as they appear to represent the final score
    const currentScores = fixture.scores.filter((score: Score) => score.description === "CURRENT");
    
    if (currentScores.length === 0) {
      throw new Error('No "CURRENT" scores found. The game might not be finished.');
    }
    
    const homeScoreObj = currentScores.find((s: Score) => s.score.participant.toLowerCase() === "home");
    const awayScoreObj = currentScores.find((s: Score) => s.score.participant.toLowerCase() === "away");
    
    if (!homeScoreObj || !awayScoreObj) {
      throw new Error('Incomplete score data');
    }
    
    console.log(`Fetched scores for gameId ${gameId}: Home = ${homeScoreObj.score.goals}, Away = ${awayScoreObj.score.goals}`);
    
    return {
      homeScore: homeScoreObj.score.goals,
      awayScore: awayScoreObj.score.goals,
      isFinished: true // Assume if we have CURRENT scores, the game is finished
    };
  } catch (error) {
    console.error(`Error fetching details for game ${gameId}:`, error);
    return null;
  }
}

// Resolve market on-chain
async function resolveMarket(marketId: string, outcome: number) {
  try {
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, wallet);
    
    console.log(`Resolving marketId ${marketId} with outcome ${outcome}`);
    
    const tx = await contract.resolveMarket(marketId, outcome);
    console.log(`Transaction submitted: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`Market ${marketId} resolved successfully. Transaction hash: ${receipt.hash}`);
    
    return {
      marketId,
      outcome,
      transactionHash: receipt.hash
    };
  } catch (error) {
    console.error(`Error resolving marketId ${marketId}:`, error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { date, address } = body;
    
    // Basic validation
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }
    
    // Verify user has permission to resolve markets
    const hasPermission = await verifyRole(address, 'resolver');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Unauthorized: You do not have permission to resolve markets' }, { status: 403 });
    }
    
    // Check for required environment variables
    if (!PRIVATE_KEY || !INFURA_URL || !API_TOKEN) {
      return NextResponse.json({ error: 'Server configuration error: Missing required environment variables' }, { status: 500 });
    }
    
    // Fetch markets for the given date
    const markets = await fetchMarketsForDate(date);
    
    if (markets.length === 0) {
      return NextResponse.json({ 
        message: `No markets found for date ${date}`,
        count: 0
      }, { status: 404 });
    }
    
    // Resolve each market
    const resolvedMarkets = [];
    for (const market of markets) {
      try {
        // Check if market is already resolved
        const resolved = await isMarketResolved(market.marketId);
        if (resolved) {
          console.log(`Market ${market.marketId} is already resolved. Skipping.`);
          continue;
        }
        
        // Fetch game result
        const result = await fetchGameResult(market.gameId);
        if (!result || !result.isFinished) {
          console.log(`Game ${market.gameId} is not finished yet. Skipping market ${market.marketId}.`);
          continue;
        }
        
        // Determine outcome: 0 for away win, 1 for home win, 2 for draw
        let outcome;
        if (result.awayScore > result.homeScore) outcome = 0;
        else if (result.homeScore > result.awayScore) outcome = 1;
        else outcome = 2;
        
        // Resolve the market
        const resolution = await resolveMarket(market.marketId, outcome);
        resolvedMarkets.push({
          ...resolution,
          gameId: market.gameId,
          question: market.question,
          result: `${result.awayScore} - ${result.homeScore}`
        });
      } catch (error) {
        console.error(`Error resolving market ${market.marketId}:`, error);
        // Continue with the next market
      }
    }
    
    // Return resolved markets
    return NextResponse.json({ 
      message: `Successfully resolved markets for date ${date}`, 
      count: resolvedMarkets.length,
      resolvedMarkets
    });
  } catch (error: Error | unknown) {
    console.error('Error in resolve-markets API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to resolve markets';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 