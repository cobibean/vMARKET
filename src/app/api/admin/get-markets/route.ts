import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ethers } from 'ethers';
import marketVestaABI from '../../../vesta/constants/marketVestaABI';

// Contract address
const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5";
const INFURA_URL = process.env.INFURA_URL || 'https://andromeda.metis.io/?owner=1088';

// Fetch market details from on-chain
async function fetchMarketOnChain(marketId: string) {
  try {
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, provider);
    
    const marketInfo = await contract.getMarketInfo(marketId);
    
    return {
      question: marketInfo.question,
      options: marketInfo.options,
      endTime: Number(marketInfo.endTime),
      outcome: Number(marketInfo.outcome),
      totalShares: marketInfo.totalShares.map((shares: bigint) => Number(shares)),
      resolved: marketInfo.resolved
    };
  } catch (error) {
    console.error(`Error fetching market ${marketId} from chain:`, error);
    return null;
  }
}

// Get all markets from the database and chain
export async function GET(req: NextRequest) {
  try {
    const query = `
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
    
    await sql.query(query);
    
    // Get markets from database
    const result = await sql`
      SELECT * FROM markets
      ORDER BY created_at DESC
    `;
    
    // Fetch additional details from blockchain for each market
    const marketsWithDetails = await Promise.all(
      result.rows.map(async (row) => {
        const onChainData = await fetchMarketOnChain(row.market_id);
        
        return {
          id: Number(row.market_id),
          question: row.question,
          options: row.options,
          endTime: row.end_time,
          league: row.league,
          gameId: row.game_id,
          createdAt: row.created_at,
          // Include on-chain data if available
          resolved: onChainData?.resolved || false,
          outcome: onChainData?.outcome || null,
          totalShares: onChainData?.totalShares || []
        };
      })
    );
    
    return NextResponse.json({ 
      markets: marketsWithDetails
    });
  } catch (error: Error | unknown) {
    console.error('Error fetching markets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch markets';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 