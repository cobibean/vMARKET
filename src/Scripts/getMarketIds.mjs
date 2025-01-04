import { readFile } from 'fs/promises';
import { resolve } from 'path';

const mappingFilePath = resolve('./src/mappings/marketMapping.json');

async function retrieveMarketIds(games) {
    try {
        const data = await readFile(mappingFilePath, 'utf-8');
        const mappings = JSON.parse(data);

        games.forEach(game => {
            const marketId = mappings[game];
            if (marketId) {
                console.log(`Market ID for ${game}: ${marketId}`);
            } else {
                console.log(`No market ID found for ${game}`);
            }
        });
    } catch (error) {
        console.error('Error reading market mapping file:', error);
    }
}

// Specify the games you want to retrieve market IDs for
const gamesToCheck = [
    'Atlanta Hawks @ Los Angeles Lakers (2025-01-03)',
    // Add more games as needed
];

retrieveMarketIds(gamesToCheck);