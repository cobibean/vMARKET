import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

const unresolvedMarketsFile = resolve('./unresolved_markets.json');
const gamesDir = resolve('./src/games');
const outputFile = resolve('./markets_to_resolve.json');

const mapMarketsToGames = async () => {
  try {
    // Load unresolved markets
    const unresolvedMarkets = JSON.parse(await readFile(unresolvedMarketsFile, 'utf-8'));

    // Fetch all game results
    const gamesFiles = ["games-2025-01-02.json"]; // Add relevant filenames here
    let allGames = [];
    for (const file of gamesFiles) {
      const games = JSON.parse(await readFile(resolve(gamesDir, file), 'utf-8'));
      allGames = [...allGames, ...games];
    }

    const marketsToResolve = unresolvedMarkets.map((market) => {
      const game = allGames.find(
        (g) =>
          market.question.includes(g.away_team) &&
          market.question.includes(g.home_team)
      );

      if (!game || game.home_score === null || game.away_score === null) {
        console.log(`No valid game result found for market ID ${market.marketId}`);
        return null;
      }

      // Determine the outcome
      let outcome;
      if (game.home_score > game.away_score) {
        outcome = 2; // Home team win
      } else if (game.home_score < game.away_score) {
        outcome = 1; // Away team win
      } else {
        outcome = 0; // Draw
      }

      return {
        marketId: market.marketId,
        question: market.question,
        outcome,
      };
    }).filter(Boolean); // Remove null entries

    // Save the mapped results to a file
    await writeFile(outputFile, JSON.stringify(marketsToResolve, null, 2), 'utf-8');
    console.log(`Markets to resolve saved to ${outputFile}`);
  } catch (error) {
    console.error('Error mapping markets to games:', error);
  }
};

mapMarketsToGames();