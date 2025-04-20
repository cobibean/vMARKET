import 'dotenv/config';
import fetch from 'node-fetch'; // Ensure you have node-fetch installed (npm install node-fetch)
import { writeFile, mkdir } from 'fs/promises';
import { resolve } from 'path';

// ================================
// Configuration Section
// ================================
const API_BASE_URL = 'https://api.sportmonks.com/v3/football/fixtures/date/';
const API_TOKEN = 'YTTir99m6yR9GVRoC8AXsjs1m4UxrAkVzrwWUlZ0rBljLX0r1b9yeksCzTfj';
// Check for command line argument or use default
const TARGET_DATE = process.argv[2] || '2025-05-07';
// Use both "participants" and "events" in the include parameter:
const INCLUDE_PARAMS = 'participants;events';

// Directory for saving the output file
const outputDir = resolve('./src/app/vesta/games/CL');

// ================================
// Main Fetch Function
// ================================
const fetchCLGames = async (filterDate) => {
  try {
    // Build the URL with the updated include parameters.
    const url = `${API_BASE_URL}${filterDate}?api_token=${API_TOKEN}&include=${INCLUDE_PARAMS}`;
    console.log(`Fetching fixtures from URL: ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Raw API Data:", JSON.stringify(data, null, 2));

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Unexpected response structure: missing "data" array.');
    }

    // Map each game to include separate team objects for home and away.
    const mappedGames = data.data.map((game) => {
      // Extract local date from the starting_at string (assumes "YYYY-MM-DD HH:MM:SS" format).
      const local_date = game.starting_at.split(" ")[0];
      const start_time = game.starting_at;

      // Use the participants array to get detailed team info.
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
        // Home team details:
        home_team: {
          team_id: homeParticipant ? homeParticipant.id : null,
          name: homeParticipant ? homeParticipant.name : 'Unknown',
          // Optionally, include other fields from the home team if needed.
          short_code: homeParticipant ? homeParticipant.short_code : null,
          image_path: homeParticipant ? homeParticipant.image_path : null
        },
        // Away team details:
        away_team: {
          team_id: awayParticipant ? awayParticipant.id : null,
          name: awayParticipant ? awayParticipant.name : 'Unknown',
          short_code: awayParticipant ? awayParticipant.short_code : null,
          image_path: awayParticipant ? awayParticipant.image_path : null
        },
        // Optionally, pass along events if you plan to use them later.
        events: game.events || []
      };
    });

    // Ensure the output directory exists.
    await mkdir(outputDir, { recursive: true });

    // Write the mapped game data to a JSON file.
    const filePath = `${outputDir}/games-${filterDate}.json`;
    await writeFile(filePath, JSON.stringify(mappedGames, null, 2), 'utf-8');
    console.log(`Data saved to ${filePath}`);
  } catch (error) {
    console.error("Error fetching or processing CL games:", error);
  }
};

// ================================
// Execute the Fetch Function
// ================================
console.log(`Fetching CL games for date: ${TARGET_DATE}`);
fetchCLGames(TARGET_DATE);