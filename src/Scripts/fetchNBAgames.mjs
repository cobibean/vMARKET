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
  "x-rapidapi-host": "v2.nba.api-sports.io"
};

const requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

// Directory for saving the output
const outputDir = resolve('./src/games');
const timeZone = 'America/Chicago';

const fetchGameData = async (filterDate) => {
  const { previous, current, next } = getAdjacentDates(filterDate);

  const datesToFetch = [previous, current, next];
  let allGames = [];

  for (const date of datesToFetch) {
    const url = `https://v2.nba.api-sports.io/games?date=${date}`;
    try {
      const response = await fetch(url, requestOptions);
      const data = await response.json();

      console.log(`Raw API data for ${date}:`, JSON.stringify(data.response, null, 2));

      const games = (data.response || []).map(game => {
        const localDate = convertToLocalDate(game?.date?.start, timeZone);
        console.log(`Game UTC: ${game?.date?.start}, Local Date: ${localDate}`);
        return {
          home_team: game?.teams?.home?.name || "Unknown",
          away_team: game?.teams?.visitors?.name || "Unknown",
          local_date: localDate,
          start_time: game?.date?.start || "Unknown",
          end_time: game?.date?.end || "Not available",
          home_score: game?.scores?.home?.points !== undefined ? game.scores.home.points : "N/A",
          away_score: game?.scores?.visitors?.points !== undefined ? game.scores.visitors.points : "N/A",
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
const dates = ["2025-01-05"]; // Local dates in YYYY-MM-DD format

// Fetch game data for all dates and save to files
dates.forEach(date => fetchGameData(date));