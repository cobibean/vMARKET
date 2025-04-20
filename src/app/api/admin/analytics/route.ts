import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ethers } from 'ethers';
import marketVestaABI from '../../../vesta/constants/marketVestaABI';

// Contract address
const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5";
const INFURA_URL = process.env.INFURA_URL || '';

export async function GET(req: NextRequest) {
  try {
    // Query to get basic market stats
    const marketCountQuery = await sql`
      SELECT 
        COUNT(*) as total_markets,
        SUM(CASE WHEN now() < to_timestamp(end_time) THEN 1 ELSE 0 END) as active_markets,
        SUM(CASE WHEN now() >= to_timestamp(end_time) THEN 1 ELSE 0 END) as resolved_markets,
        COUNT(DISTINCT league) as league_count
      FROM markets
    `;
    
    // Query to get league distribution
    const leagueDistributionQuery = await sql`
      SELECT 
        league, 
        COUNT(*) as count
      FROM markets
      GROUP BY league
      ORDER BY count DESC
    `;
    
    // Query to get recent markets
    const recentMarketsQuery = await sql`
      SELECT 
        market_id, 
        question, 
        league,
        end_time
      FROM markets
      ORDER BY created_at DESC
      LIMIT 5
    `;

    // Get market counts
    const totalMarkets = parseInt(marketCountQuery.rows[0].total_markets) || 0;
    const activeMarkets = parseInt(marketCountQuery.rows[0].active_markets) || 0;
    const resolvedMarkets = parseInt(marketCountQuery.rows[0].resolved_markets) || 0;
    
    // Calculate league distribution percentages
    const leagueDistribution = leagueDistributionQuery.rows.map(row => {
      const count = parseInt(row.count);
      return {
        label: formatLeagueName(row.league),
        count,
        percentage: totalMarkets > 0 ? Math.round((count / totalMarkets) * 1000) / 10 : 0
      };
    });
    
    // Fetch total shares for each recent market
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, provider);
    
    const recentMarketsWithShares = await Promise.all(
      recentMarketsQuery.rows.map(async (row) => {
        try {
          const marketInfo = await contract.getMarketInfo(row.market_id);
          const totalSharesForMarket = marketInfo.totalShares.reduce(
            (sum: bigint, shares: bigint) => sum + shares, 
            BigInt(0)
          );
          
          return {
            id: Number(row.market_id),
            question: row.question,
            resolved: new Date() >= new Date(row.end_time * 1000),
            totalShares: Number(totalSharesForMarket)
          };
        } catch (error) {
          console.error(`Error fetching shares for market ${row.market_id}:`, error);
          return {
            id: Number(row.market_id),
            question: row.question,
            resolved: new Date() >= new Date(row.end_time * 1000),
            totalShares: 0
          };
        }
      })
    );
    
    // Calculate total shares across all markets
    const totalShares = recentMarketsWithShares.reduce(
      (sum, market) => sum + market.totalShares, 
      0
    );
    
    return NextResponse.json({
      stats: {
        totalMarkets,
        activeMarkets,
        resolvedMarkets,
        totalShares,
        recentMarkets: recentMarketsWithShares
      },
      leagueDistribution
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    
    // If the error is likely due to tables not existing yet, return mock data
    if (error.message && error.message.includes('does not exist')) {
      return NextResponse.json({
        stats: {
          totalMarkets: 0,
          activeMarkets: 0,
          resolvedMarkets: 0,
          totalShares: 0,
          recentMarkets: []
        },
        leagueDistribution: []
      });
    }
    
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}

// Helper to format league names for display
function formatLeagueName(league: string): string {
  switch(league) {
    case 'CL':
      return 'Champions League';
    case 'EPL':
      return 'Premier League';
    case 'NFL':
      return 'NFL';
    case 'NBA':
      return 'NBA';
    default:
      return league;
  }
} 