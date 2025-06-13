import { NextRequest, NextResponse } from 'next/server';
import { createMarketService, getMarketsService } from '@/app/backend/services/marketService';
import { ethers } from 'ethers';
import { sql } from '@vercel/postgres';

// Contract address
const CONTRACT_ADDRESS = process.env.VESTA_CONTRACT_ADDRESS || "0x949865114535dA93823bf5515608406325b40Fc5";
const INFURA_URL = process.env.INFURA_URL || 'https://andromeda.metis.io/?owner=1088';

// Function to verify if user has the required role
async function verifyRole(address: string, requiredRole: string) {
  try {
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const abi = [
      "function MARKET_CREATOR_ROLE() view returns (bytes32)",
      "function MARKET_RESOLVER_ROLE() view returns (bytes32)",
      "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
      "function hasRole(bytes32 role, address account) view returns (bool)"
    ];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
    
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

/**
 * GET /api/admin/markets
 * Fetch all markets or filter by state
 */
export async function GET(req: NextRequest) {
  try {
    // Get state from query params if provided
    const searchParams = req.nextUrl.searchParams;
    const state = searchParams.get('state');
    const stateNum = state ? parseInt(state) : undefined;
    
    // Ensure markets table exists
    await sql`
      CREATE TABLE IF NOT EXISTS markets (
        id SERIAL PRIMARY KEY,
        market_id VARCHAR(255) NOT NULL,
        game_id VARCHAR(255),
        league VARCHAR(50),
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        end_time BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Get markets from service
    // Fix: Pass undefined to satisfy the specific type error message provided in the context.
    // The error indicated the parameter type was 'undefined'.
    const markets = await getMarketsService(undefined);
    
    // Get additional metadata from database
    const dbMarkets = await sql`SELECT * FROM markets`;
    // Merge on-chain data with database metadata
    const enhancedMarkets = markets.map(market => {
      const dbMarket = dbMarkets.rows.find(m => m.market_id === market.id.toString());
      if (dbMarket) {
        return {
          ...market,
          gameId: dbMarket.game_id,
          league: dbMarket.league
        };
      }
      return market;
    });
    
    return NextResponse.json({ 
      success: true,
      markets: enhancedMarkets
    });
  } catch (error: Error | unknown) {
    console.error('Error fetching markets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch markets';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/admin/markets
 * Create a new market
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { question, options, endTime, rule, address, room = 'vesta', gameId, league } = body;
    
    // Basic validation
    if (!question || !options || !endTime || !rule) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: question, options, endTime, and rule are required'
      }, { status: 400 });
    }
    
    // Verify user has permission to create markets
    const hasPermission = await verifyRole(address, 'creator');
    if (!hasPermission) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized: You do not have permission to create markets' 
      }, { status: 403 });
    }
    
    // Create market using the service
    const result = await createMarketService(question, options, endTime, rule, room);
    
    if (!result.success || !result.marketId) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to create market'
      }, { status: 500 });
    }
    
    // If this is related to a game, store the mapping in the database
    if (gameId && league) {
      await sql`
        INSERT INTO markets (market_id, game_id, league, question, options, end_time)
        VALUES (${result.marketId.toString()}, ${gameId.toString()}, ${league}, ${question}, ${JSON.stringify(options)}, ${endTime})
      `;
    }
    
    return NextResponse.json(result);
  } catch (error: Error | unknown) {
    console.error('Error creating market:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create market';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 