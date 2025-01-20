import 'dotenv/config';
import fetch from 'node-fetch'; // Ensure you have node-fetch installed
import { writeFile, mkdir } from 'fs/promises';
import { resolve } from 'path';

// API setup
const API_URL = `https://api-football-v1.p.rapidapi.com/v3/fixtures?league=39&season=2024`; // EPL league ID (39) and season
const API_HEADERS = {
  "x-rapidapi-key": process.env.RAPIDAPI_EPL_KEY, // Replace with your key
  "x-rapidapi-host": "api-football-v1.p.rapidapi.com"
};

// Directory for saving the output
const outputDir = resolve('./src/app/vesta/games/EPL');

// Fetch EPL game data
const fetchEPLGames = async (filterDate) => {
  try {
    // Fetch games from the API
    const response = await fetch(API_URL, { headers: API_HEADERS });
    const data = await response.json();

    // Log raw API data for debugging
    console.log("Raw API Data:", JSON.stringify(data, null, 2));

    // Map games into a usable format
    const allGames = data.response.map((fixture) => {
      const homeTeam = fixture.teams.home.name || "Unknown";
      const awayTeam = fixture.teams.away.name || "Unknown";

      return {
        game_id: fixture.fixture.id,
        home_team: homeTeam,
        away_team: awayTeam,
        local_date: fixture.fixture.date.split("T")[0], // Extract YYYY-MM-DD
        start_time: fixture.fixture.date, // Full ISO datetime
        home_score: fixture.goals.home,
        away_score: fixture.goals.away,
        status: fixture.fixture.status.short // Status code (e.g., NS, LIVE, FT)
      };
    });

    // Filter games by the specified local date
    const filteredGames = allGames.filter((game) => game.local_date === filterDate);
    console.log(`Filtered games for ${filterDate}:`, filteredGames);

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true });

    // Write filtered games to a file
    const filePath = `${outputDir}/games-${filterDate}.json`;
    await writeFile(filePath, JSON.stringify(filteredGames, null, 2), 'utf-8');
    console.log(`Data saved to ${filePath}`);
  } catch (error) {
    console.error("Error fetching or processing EPL games:", error);
  }
};

// Specify the date you want to filter games for
const filterDate = "2025-01-25"; // Replace with your desired date
fetchEPLGames(filterDate);