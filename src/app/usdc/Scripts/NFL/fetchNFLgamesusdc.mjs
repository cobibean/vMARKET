import 'dotenv/config';
import fetch from 'node-fetch';
import { writeFile, mkdir } from 'fs/promises';
import { resolve } from 'path';
import { DateTime } from 'luxon';

// Function to convert UTC start time to local time zone and ISO string
const convertToLocalTime = (utcDate, timeZone) => {
  return DateTime.fromISO(utcDate, { zone: 'utc' })
    .setZone(timeZone)
    .toISO(); // Returns ISO string in the local time zone
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
  "x-rapidapi-host": "v1.american-football.api-sports.io",
};

const requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow',
};

// Directory for saving the output
const outputDir = resolve('./src/app/usdc/games/NFL');
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

      const games = (data.response || [])
          .filter(game => game.league.name === "NFL") // Filter for NFL games only
          .map(game => {
      const gameInfo = game.game;

    try {
      // Construct UTC start time
      const rawDate = gameInfo.date.date || "Unknown";
      const rawTime = gameInfo.date.time || "Unknown";

      console.log(`Raw date: ${rawDate}, Raw time: ${rawTime}`);

      const utcStartTime = `${rawDate}T${rawTime}:00Z`;
      console.log(`Constructed utcStartTime: ${utcStartTime}`);

      // Convert UTC start time to local date and time
      const localStartTime = convertToLocalTime(utcStartTime, timeZone);
      const localDate = localStartTime.split('T')[0]; // Extract local date from ISO string
      

      return {
        game_id: gameInfo.id,
        stage: gameInfo.stage || "Unknown",
        week: gameInfo.week || "Unknown",
        home_team: game.teams.home.name || "Unknown",
        away_team: game.teams.away.name || "Unknown",
        local_date: localDate,
        start_time: localStartTime, // Localized start time
        venue: gameInfo.venue.name || "Unknown",
        city: gameInfo.venue.city || "Unknown",
        home_score: game.scores.home.total || null,
        away_score: game.scores.away.total || null,
        status_short: gameInfo.status.short || "Unknown",
        status_long: gameInfo.status.long || "Unknown",
      };
    } catch (error) {
      console.error(`Error processing game ${gameInfo.id}:`, error);
      return null; // Skip this game
    }
  })
  .filter(game => game !== null); // Remove games that failed to process

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
const dates = ["2025-01-19"]; // Local dates in YYYY-MM-DD format

// Fetch game data for all dates and save to files
dates.forEach(date => fetchGameData(date));