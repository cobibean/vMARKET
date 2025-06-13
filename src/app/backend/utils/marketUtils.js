import moment from "moment-timezone";
import path from "path";
import { promises as fs } from "fs";

// Shared paths
export const RULES_PATH = process.env.RULES_PATH || path.resolve("./public/rules.json");

// Parse options function
export function parseOptions(optionsInput) {
  try {
    const options = JSON.parse(optionsInput);
    if (!Array.isArray(options) || options.length < 2) {
      throw new Error("Options must be a JSON array with at least two items.");
    }
    return options;
  } catch (error) {
    throw new Error(`Invalid options format: ${error.message}`);
  }
}

// Parse end time function
export function parseEndTime(endTimeInput) {
  const now = Math.floor(Date.now() / 1000);
  
  if (/^\d+$/.test(endTimeInput)) {
    return parseInt(endTimeInput, 10) - now;
  } else {
    const parsedTime = moment.tz(endTimeInput, "YYYY-MM-DD HH:mm", "America/Chicago");
    if (!parsedTime.isValid()) {
      throw new Error("Invalid end time format. Use YYYY-MM-DD HH:mm or a Unix timestamp.");
    }
    return parsedTime.unix() - now;
  }
}

// Save rule function
export async function saveRule(marketId, question, rule, room = 'vesta') {
  try {
    const newRule = { marketId, question, rule, room };
    let existingRules = [];
    
    try {
      const fileContent = await fs.readFile(RULES_PATH, "utf8");
      existingRules = fileContent.trim() ? JSON.parse(fileContent) : [];
    } catch (error) {
      console.warn("Failed to read rules.json. Initializing as empty.");
    }
    
    existingRules.push(newRule);
    await fs.writeFile(RULES_PATH, JSON.stringify(existingRules, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error saving rule:", error);
    return false;
  }
} 