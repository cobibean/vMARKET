import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * GET /api/admin/games
 * Get games with optional filtering by date and league
 */
export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date');
    const league = searchParams.get('league');
    
    // Ensure the games table exists
    await sql`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(255) NOT NULL,
        league VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Build query based on parameters
    let query;
    if (date && league) {
      query = sql`
        SELECT * FROM games WHERE date = ${date} AND league = ${league}
        ORDER BY date DESC
      `;
    } else if (date) {
      query = sql`
        SELECT * FROM games WHERE date = ${date}
        ORDER BY league, created_at DESC
      `;
    } else if (league) {
      query = sql`
        SELECT * FROM games WHERE league = ${league}
        ORDER BY date DESC, created_at DESC
      `;
    } else {
      query = sql`
        SELECT * FROM games
        ORDER BY date DESC, league, created_at DESC
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
      games,
      count: games.length
    });
    
  } catch (error: Error | unknown) {
    console.error('Error fetching games:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch games';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/admin/games
 * Add games from sports data APIs to the database
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { league, date, games } = body;
    
    // Basic validation
    if (!league || !date || !games || !Array.isArray(games)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: league, date, and games array are required'
      }, { status: 400 });
    }
    
    // Ensure the games table exists
    await sql`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(255) NOT NULL,
        league VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Store games in the database
    let added = 0;
    let updated = 0;
    
    for (const game of games) {
      const gameId = game.game_id || game.id;
      
      if (!gameId) {
        console.warn("Skipping game without ID:", game);
        continue;
      }
      
      // Check if this game already exists
      const existingGame = await sql`
        SELECT id FROM games WHERE game_id = ${gameId.toString()} AND league = ${league}
      `;
      
      if (existingGame.rows.length > 0) {
        // Update existing game
        await sql`
          UPDATE games 
          SET data = ${JSON.stringify(game)}, date = ${date}
          WHERE game_id = ${gameId.toString()} AND league = ${league}
        `;
        updated++;
      } else {
        // Insert new game
        await sql`
          INSERT INTO games (game_id, league, date, data)
          VALUES (${gameId.toString()}, ${league}, ${date}, ${JSON.stringify(game)})
        `;
        added++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully processed games for ${league} on ${date}`,
      added,
      updated,
      total: added + updated
    });
    
  } catch (error: Error | unknown) {
    console.error('Error adding games:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add games';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 