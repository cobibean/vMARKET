import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * GET /api/admin/games/[league]
 * Get games for a specific league with optional date filtering
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { league: string } }
) {
  try {
    const league = params.league;
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date');
    
    // Build query based on parameters
    let query;
    if (date) {
      query = sql`
        SELECT * FROM games WHERE league = ${league} AND date = ${date}
        ORDER BY created_at DESC
      `;
    } else {
      query = sql`
        SELECT * FROM games WHERE league = ${league}
        ORDER BY date DESC, created_at DESC
        LIMIT 100
      `;
    }
    
    const result = await query;
    
    // Transform the data for the response
    const games = result.rows.map(row => ({
      id: row.id,
      gameId: row.game_id,
      league: row.league,
      date: row.date,
      ...row.data
    }));
    
    return NextResponse.json({
      success: true,
      league,
      date: date || 'all',
      games,
      count: games.length
    });
    
  } catch (error: Error | unknown) {
    console.error(`Error fetching games for league ${params.league}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch games';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/admin/games/[league]
 * Perform batch operations on games for a specific league
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { league: string } }
) {
  try {
    const league = params.league;
    
    // Parse request body
    const body = await req.json();
    const { action, date, gameIds } = body;
    
    // Basic validation
    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: action'
      }, { status: 400 });
    }
    
    // Handle different actions
    if (action === 'delete') {
      // Validate input for delete operation
      if (!gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Missing or invalid gameIds for delete operation'
        }, { status: 400 });
      }
      
      // Delete specified games one by one to avoid type issues
      const deletedIds = [];
      for (const gameId of gameIds) {
        const result = await sql`
          DELETE FROM games 
          WHERE game_id = ${gameId.toString()} AND league = ${league}
          RETURNING game_id
        `;
        if (result.rows.length > 0) {
          deletedIds.push(result.rows[0].game_id);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${deletedIds.length} games from ${league}`,
        deletedIds
      });
    } 
    else if (action === 'create_markets') {
      // Validate input for create_markets operation
      if (!date) {
        return NextResponse.json({
          success: false,
          error: 'Missing date for create_markets operation'
        }, { status: 400 });
      }
      
      // This would be handled by a separate endpoint
      // Redirect to the appropriate endpoint
      return NextResponse.json({
        success: false,
        error: 'Please use the /api/admin/markets endpoint for market creation',
        redirect: '/api/admin/markets'
      }, { status: 400 });
    }
    else {
      return NextResponse.json({
        success: false,
        error: `Unsupported action: ${action}`
      }, { status: 400 });
    }
    
  } catch (error: Error | unknown) {
    console.error(`Error performing action on games for league ${params.league}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to perform action';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 