import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date');
    const league = searchParams.get('league') || 'CL';

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Define path to games file
    const gamesPath = resolve(`./src/app/vesta/games/${league}/games-${date}.json`);

    try {
      // Read the games file
      const gamesData = await readFile(gamesPath, 'utf-8');
      const games = JSON.parse(gamesData);

      return NextResponse.json({ games });
    } catch (err) {
      // If file doesn't exist, return empty array
      return NextResponse.json({ games: [] });
    }
  } catch (error: any) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch games' },
      { status: 500 }
    );
  }
} 