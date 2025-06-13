import { NextRequest, NextResponse } from 'next/server';
import { resolveMarketService } from '@/app/backend/services/marketService';
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
 * GET /api/admin/markets/[id]
 * Get details for a specific market
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = params.id;
    
    if (!marketId || isNaN(Number(marketId))) {
      return NextResponse.json({
        success: false,
        error: 'Invalid market ID'
      }, { status: 400 });
    }
    
    // Fetch market details from blockchain
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const abi = [
      "function getMarketInfo(uint256 _marketId) view returns (string memory question, string[] memory options, uint256 endTime, uint8 outcome, uint256[] memory totalShares, bool resolved)"
    ];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
    
    const marketInfo = await contract.getMarketInfo(marketId);
    
    // Fetch additional metadata from database
    const dbResult = await sql`
      SELECT * FROM markets WHERE market_id = ${marketId}
    `;
    
    const dbMarket = dbResult.rows[0];
    
    const market = {
      id: Number(marketId),
      question: marketInfo.question,
      outcomes: marketInfo.options,
      endTime: Number(marketInfo.endTime),
      state: marketInfo.resolved ? 1 : 0,
      outcome: Number(marketInfo.outcome),
      totalShares: marketInfo.totalShares.map((share: bigint) => Number(share)),
      gameId: dbMarket?.game_id,
      league: dbMarket?.league
    };
    
    return NextResponse.json({
      success: true,
      market
    });
    
  } catch (error: Error | unknown) {
    console.error(`Error fetching market ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch market';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

/**
 * PUT /api/admin/markets/[id]
 * Resolve a market
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = params.id;
    
    if (!marketId || isNaN(Number(marketId))) {
      return NextResponse.json({
        success: false,
        error: 'Invalid market ID'
      }, { status: 400 });
    }
    
    // Parse request body
    const body = await req.json();
    const { outcome, address, room = 'vesta' } = body;
    
    // Basic validation
    if (outcome === undefined || outcome === null) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: outcome'
      }, { status: 400 });
    }
    
    // Verify user has permission to resolve markets
    const hasPermission = await verifyRole(address, 'resolver');
    if (!hasPermission) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized: You do not have permission to resolve markets' 
      }, { status: 403 });
    }
    
    // Resolve market using the service
    const result = await resolveMarketService(Number(marketId), outcome, room);
    
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to resolve market'
      }, { status: 500 });
    }
    
    return NextResponse.json(result);
    
  } catch (error: Error | unknown) {
    console.error(`Error resolving market ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to resolve market';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 