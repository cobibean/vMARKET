import 'dotenv/config';
import fetch from 'node-fetch';
import { writeFile, mkdir } from 'fs/promises';
import { resolve } from 'path';

// Helper function to convert UTC to local date in YYYY-MM-DD format
const convertToLocalDate = (utcDate, timeZone) => {
  const date = new Date(utcDate);
  const localDate = date.toLocaleDateString('en-CA', { timeZone }); // Returns "YYYY-MM-DD"
  return localDate;
};

// Function to calculate adjacent dates
const getAdjacentDates = (date) => {
  const current = new Date(date);
  const prev = new Date(current);
  const next = new Date(current);
  prev.setDate(current.getDate() - 1);
  next.setDate(current.getDate() + 1);
  return {
    previous: prev.toISOString().split('T')[0],
    current: current.toISOString().split('T')[0],
    next: next.toISOString().split('T')[0],
  };
};

const myHeaders = {
  "x-rapidapi-key": process.env.RAPIDAPI_KEY, 
  "x-rapidapi-host": "v1.american-football.api-sports.io"
};

const requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

// Directory for saving the output
const outputDir = resolve('./src/games/NFL');
const timeZone = 'America/Chicago';

const fetchGameData = async (filterDate) => {
  const { previous, current, next } = getAdjacentDates(filterDate);

  const datesToFetch = [previous, current, next];
  let allGames = [];

  for (const date of datesToFetch) {
    const url = `https://v1.american-football.api-sports.io/games?date=${date}`;
    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      console.log(`Raw API data for ${date}:`, JSON.stringify(data.response, null, 2));

      const games = (data.response || []).filter(game => game.league.name === "NFL").map(game => {
        const gameInfo = game.game;
        const localDate = convertToLocalDate(gameInfo.date.timestamp * 1000, timeZone); // Convert timestamp to local date
      
        return {
          game_id: gameInfo.id,
          stage: gameInfo.stage || "Unknown",
          week: gameInfo.week || "Unknown",
          home_team: game.teams.home.name || "Unknown",
          away_team: game.teams.away.name || "Unknown",
          local_date: localDate,
          start_time: gameInfo.date.date + "T" + gameInfo.date.time, // Combine date and time for ISO format
          venue: gameInfo.venue.name || "Unknown",
          city: gameInfo.venue.city || "Unknown",
          home_score: game.scores.home.total || null,
          away_score: game.scores.away.total || null,
          status_short: gameInfo.status.short || "Unknown",
          status_long: gameInfo.status.long || "Unknown"
        };
      });

      allGames = [...allGames, ...games];
    } catch (error) {
      console.error(`Error fetching game data for ${date}:`, error);
    }
  }

  // Filter games by their local date matching the requested filterDate
  const filteredGames = allGames.filter(game => game.local_date === filterDate);

  console.log(`Filtered games for ${filterDate}:`, filteredGames);

  // Ensure the output directory exists
  await mkdir(outputDir, { recursive: true });

  // Write filtered games to a file
  const filePath = `${outputDir}/games-${filterDate}.json`;
  console.log(`Saving to file: ${filePath}`);
  await writeFile(filePath, JSON.stringify(filteredGames, null, 2), 'utf-8');
  console.log(`Data for ${filterDate} saved to ${filePath}`);
};

// Dates to fetch games for
const dates = ["2025-01-04"]; // Local dates in YYYY-MM-DD format

// Fetch game data for all dates and save to files
dates.forEach(date => fetchGameData(date));