import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ethers } from 'ethers';
import marketVestaABI from '../../../vesta/constants/marketVestaABI';

// Contract address
const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5";

// Market creation requires private key
const PRIVATE_KEY = process.env.MARKET_CREATOR_PRIVATE_KEY || '';
const INFURA_URL = process.env.INFURA_URL || '';

interface Game {
  game_id: string | number;
  start_time: string;
  local_date: string;
  home_team: {
    name: string;
  };
  away_team: {
    name: string;
  };
  [key: string]: unknown; // For other properties we might need
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
  } catch (error: unknown) {
    console.error('Error verifying role:', error);
    return false;
  }
}

// Fetch games from the database
async function fetchGamesFromDB(league: string, date: string) {
  try {
    const result = await sql`
      SELECT * FROM games
      WHERE league = ${league} AND date = ${date}
    `;
    
    return result.rows.map(row => {
      return {
        ...row.data,
        id: row.id
      };
    });
  } catch (error) {
    console.error(`Error fetching games from database for ${league} on ${date}:`, error);
    throw error;
  }
}

// Check if market already exists for a game
async function marketExistsForGame(gameId: string) {
  try {
    const result = await sql`
      SELECT * FROM markets
      WHERE game_id = ${gameId}
    `;
    
    return result.rows.length > 0;
  } catch (error: unknown) {
    // If markets table doesn't exist yet, create it
    if (error instanceof Error && error.message.includes('does not exist')) {
      await sql`
        CREATE TABLE IF NOT EXISTS markets (
          id SERIAL PRIMARY KEY,
          market_id VARCHAR(255) NOT NULL,
          game_id VARCHAR(255) NOT NULL,
          league VARCHAR(50) NOT NULL,
          question TEXT NOT NULL,
          options JSONB NOT NULL,
          end_time BIGINT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      return false;
    }
    
    console.error('Error checking if market exists:', error);
    throw error;
  }
}

// Create a market for a game and store mapping
async function createMarketForGame(game: Game, league: string) {
  try {
    // Skip if market already exists for this game
    const exists = await marketExistsForGame(game.game_id.toString());
    if (exists) {
      console.log(`Market already exists for game_id=${game.game_id}. Skipping.`);
      return null;
    }
    
    // Validate game data
    if (!game.start_time || isNaN(Date.parse(game.start_time))) {
      console.log(`Skipping game due to invalid start_time:`, game);
      return null;
    }
    
    // Convert "2025-02-11 17:45:00" to "2025-02-11T17:45:00Z" so it's correctly parsed as UTC
    const gameStart = new Date(game.start_time.replace(' ', 'T') + 'Z');
    const now = new Date();
    const duration = Math.floor((gameStart.getTime() - now.getTime()) / 1000);
    
    if (duration <= 0) {
      console.log(`Skipping market for ${game.away_team.name} @ ${game.home_team.name}: game already started.`);
      return null;
    }
    
    // Build the market question
    const question = `${game.away_team.name} @ ${game.home_team.name} (${game.local_date})`;
    
    // Define options: away team (option 0), home team (option 1), and "Draw in regular time" (option 2)
    const options = [game.away_team.name, game.home_team.name, "Draw in regular time"];
    
    // Create market on-chain
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, wallet);
    
    console.log(`Creating market: "${question}" with duration ${duration} seconds`);
    const tx = await contract.createMarket(question, options, duration);
    console.log('Transaction submitted:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);
    
    // Extract the marketId from the logs
    let marketId = null;
    const relevantLogs = receipt.logs.filter(
      (log: { address?: string }) => log.address?.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
    );
    
    for (const log of relevantLogs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog?.name === "MarketCreated") {
          marketId = parsedLog.args.marketId.toString();
          break;
        }
      } catch {
        // Ignore logs that can't be parsed
      }
    }
    
    if (marketId === null) {
      throw new Error('Failed to extract marketId from transaction logs');
    }
    
    // Store mapping in the database
    await sql`
      INSERT INTO markets (market_id, game_id, league, question, options, end_time)
      VALUES (${marketId}, ${game.game_id.toString()}, ${league}, ${question}, ${JSON.stringify(options)}, ${Math.floor(gameStart.getTime() / 1000)})
    `;
    
    console.log(`Market created for game_id=${game.game_id} | Market ID: ${marketId}`);
    
    return {
      marketId,
      question,
      options,
      gameId: game.game_id,
      endTime: Math.floor(gameStart.getTime() / 1000)
    };
  } catch (error) {
    console.error(`Error creating market for game:`, error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { league, date, address } = body;
    
    // Basic validation
    if (!league || !date) {
      return NextResponse.json({ error: 'League and date are required' }, { status: 400 });
    }
    
    // Verify user has permission to create markets
    const hasPermission = await verifyRole(address, 'creator');
    if (!hasPermission) {
      return NextResponse.json({ error: 'Unauthorized: You do not have permission to create markets' }, { status: 403 });
    }
    
    // Check for required environment variables
    if (!PRIVATE_KEY || !INFURA_URL) {
      return NextResponse.json({ error: 'Server configuration error: Missing required environment variables' }, { status: 500 });
    }
    
    // Fetch games from the database
    const games = await fetchGamesFromDB(league, date);
    
    if (games.length === 0) {
      return NextResponse.json({ 
        message: `No games found for ${league} on ${date}. Please fetch games first.`,
        count: 0
      }, { status: 404 });
    }
    
    // Create markets for each game
    const createdMarkets = [];
    for (const game of games) {
      try {
        const market = await createMarketForGame(game, league);
        if (market) {
          createdMarkets.push(market);
        }
      } catch (error) {
        console.error(`Error creating market for game ${game.game_id}:`, error);
        // Continue with the next game
      }
    }
    
    // Return created markets
    return NextResponse.json({ 
      message: `Successfully created markets for ${league} on ${date}`, 
      count: createdMarkets.length,
      markets: createdMarkets
    });
  } catch (error: Error | unknown) {
    console.error('Error in create-markets API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create markets';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 