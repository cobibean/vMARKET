import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ethers } from 'ethers';
import marketVestaABI from '../../../vesta/constants/marketVestaABI';

// Contract address
const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5";

// SportMonks API configuration
const API_BASE_URL = 'https://api.sportmonks.com/v3/football/fixtures/date/';
const API_TOKEN = process.env.SPORTMONKS_API_TOKEN || ''; // Set in .env
const INCLUDE_PARAMS = 'participants;events';

// Function to verify if user has the required role
async function verifyRole(address: string, requiredRole: string) {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);
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

// Fetch games from SportMonks API for a given league and date
async function fetchGamesFromAPI(league: string, date: string) {
  try {
    // Build URL for API request
    const url = `${API_BASE_URL}${date}?api_token=${API_TOKEN}&include=${INCLUDE_PARAMS}`;
    console.log(`Fetching fixtures from URL: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
    }
    
    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Unexpected response structure: missing "data" array.');
    }
    
    // Filter games by league if needed
    // For example, CL games might have specific league_id
    // This is a simplified example - you'll need to adjust based on the actual data structure
    let filteredGames = data.data;
    
    // Map each game to include separate team objects for home and away
    const mappedGames = filteredGames.map((game) => {
      // Extract local date from the starting_at string (assumes "YYYY-MM-DD HH:MM:SS" format)
      const local_date = game.starting_at.split(" ")[0];
      const start_time = game.starting_at;
      
      // Use the participants array to get detailed team info
      const homeParticipant = game.participants.find(
        (p) => p.meta && p.meta.location && p.meta.location.toLowerCase() === 'home'
      );
      const awayParticipant = game.participants.find(
        (p) => p.meta && p.meta.location && p.meta.location.toLowerCase() === 'away'
      );
      
      return {
        game_id: game.id,
        local_date,
        start_time,
        league_id: game.league_id,
        home_team: {
          team_id: homeParticipant ? homeParticipant.id : null,
          name: homeParticipant ? homeParticipant.name : 'Unknown',
          short_code: homeParticipant ? homeParticipant.short_code : null,
          image_path: homeParticipant ? homeParticipant.image_path : null
        },
        away_team: {
          team_id: awayParticipant ? awayParticipant.id : null,
          name: awayParticipant ? awayParticipant.name : 'Unknown',
          short_code: awayParticipant ? awayParticipant.short_code : null,
          image_path: awayParticipant ? awayParticipant.image_path : null
        },
        events: game.events || []
      };
    });
    
    // Store the mapped games in the database
    await storeGamesInDatabase(league, date, mappedGames);
    
    return mappedGames;
  } catch (error) {
    console.error(`Error fetching games for ${league} on ${date}:`, error);
    throw error;
  }
}

// Store fetched games in the Vercel Postgres database
async function storeGamesInDatabase(league: string, date: string, games: any[]) {
  try {
    // First, ensure we have a games table
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
    
    // For each game, insert or update in the database
    for (const game of games) {
      await sql`
        INSERT INTO games (game_id, league, date, data)
        VALUES (${game.game_id.toString()}, ${league}, ${date}, ${JSON.stringify(game)})
        ON CONFLICT (game_id) 
        DO UPDATE SET data = ${JSON.stringify(game)}, date = ${date}
      `;
    }
    
    console.log(`Stored ${games.length} games for ${league} on ${date} in database`);
  } catch (error) {
    console.error('Error storing games in database:', error);
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
      return NextResponse.json({ error: 'Unauthorized: You do not have permission to fetch games' }, { status: 403 });
    }
    
    // Fetch games from API
    const games = await fetchGamesFromAPI(league, date);
    
    // Return the fetched games
    return NextResponse.json({ 
      message: `Successfully fetched games for ${league} on ${date}`, 
      count: games.length,
      games 
    });
  } catch (error: any) {
    console.error('Error in fetch-games API route:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch games' }, { status: 500 });
  }
} 