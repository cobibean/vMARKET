import 'dotenv/config';
import fetch from 'node-fetch';
import { writeFile, mkdir } from 'fs/promises';
import { resolve } from 'path';
import { DateTime } from 'luxon';

// Configuration
const RAPIDAPI_KEY = process.env.RAPIDAPI_EPL_KEY;
const API_HOST = "api-football-v1.p.rapidapi.com";

// Get the target date from command line or use current date
const targetDate = process.argv[2] || DateTime.now().toISODate();

// Directory for saving the output file
const outputDir = resolve('./src/app/vesta/games/EPL');

// Format the date for the API (if needed)
const apiDateFormat = targetDate; // Use YYYY-MM-DD format

// Function to fetch EPL games for a specific date
async function fetchEPLGames(date) {
  const url = `https://${API_HOST}/v3/fixtures?date=${date}&league=39`; // EPL is league 39
  
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': API_HOST
    }
  };

  try {
    console.log(`Fetching EPL games for date: ${date}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.response || !Array.isArray(data.response)) {
      console.log(`No fixtures found for date ${date}`);
      return [];
    }
    
    // Process the games data
    const games = data.response.map(fixture => {
      // Convert UTC to local date
      const utcDateTime = fixture.fixture.date;
      const localDateTime = DateTime.fromISO(utcDateTime, { zone: 'utc' })
                              .setZone('America/Chicago');
      
      return {
        game_id: fixture.fixture.id,
        local_date: localDateTime.toISODate(),
        start_time: utcDateTime, // Keep original UTC time for duration calculations
        home_team: fixture.teams.home.name,
        away_team: fixture.teams.away.name,
        home_logo: fixture.teams.home.logo,
        away_logo: fixture.teams.away.logo,
        league_id: fixture.league.id
      };
    });
    
    // Ensure the output directory exists
    await mkdir(outputDir, { recursive: true });
    
    // Save the data to a JSON file
    const filePath = resolve(outputDir, `games-${date}.json`);
    await writeFile(filePath, JSON.stringify(games, null, 2), 'utf-8');
    
    console.log(`Found ${games.length} EPL games for ${date}`);
    console.log(`Data saved to ${filePath}`);
    
    return games;
  } catch (error) {
    console.error(`Error fetching EPL games for ${date}:`, error);
    throw error;
  }
}

// Execute the function
fetchEPLGames(apiDateFormat).catch(console.error);