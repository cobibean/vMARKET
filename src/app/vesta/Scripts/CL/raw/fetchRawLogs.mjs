
import 'dotenv/config';
import fetch from 'node-fetch'; // Ensure you have node-fetch installed
import { DateTime } from 'luxon';

// ===============================
// Configuration
// ===============================

const SPORTMONKS_API_TOKEN = process.env.SPORTMONKS_API_TOKEN || 'YOUR_API_TOKEN';
const BASE_URL = 'https://api.sportmonks.com/v3/football/fixtures/date';

// ===============================
// Helper: Build API URL
// ===============================
const buildApiUrl = (date) => {
  // For raw data, let's include scores
  // and any other sub-resources you might want
  return `${BASE_URL}/${date}?api_token=${SPORTMONKS_API_TOKEN}&include=scores;participants`;
};

// ===============================
// Main Fetch Function
// ===============================
async function fetchRawCLData(dateString) {
  try {
    // Validate the date format (just a basic check)
    // Not strictly necessary, but nice to have
    if (!DateTime.fromISO(dateString).isValid) {
      throw new Error(`Invalid date format: ${dateString}. Use YYYY-MM-DD.`);
    }
    
    const url = buildApiUrl(dateString);
    console.log(`Fetching raw data for date: ${dateString}`);
    console.log(`Request URL: ${url}\n`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Raw data for ${dateString}:`);
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error fetching raw data:', error.message);
  }
}

// ===============================
// Run the Script
// ===============================

// 1. Provide a default date or
// 2. Accept a command-line argument for the date
const targetDate = process.argv[2] || '2025-02-11'; // fallback date if none provided
fetchRawCLData(targetDate);