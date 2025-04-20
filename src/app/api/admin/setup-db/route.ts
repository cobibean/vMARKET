import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Create markets table
    await sql`
      CREATE TABLE IF NOT EXISTS markets (
        id SERIAL PRIMARY KEY,
        market_id VARCHAR(255) NOT NULL,
        game_id VARCHAR(255) NOT NULL,
        league VARCHAR(50) NOT NULL,
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        end_time BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create games table
    await sql`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        game_id VARCHAR(255) UNIQUE NOT NULL,
        data JSONB NOT NULL,
        league VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add any additional tables as needed

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully'
    });
  } catch (error: any) {
    console.error('Error setting up database:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to set up database'
    }, { status: 500 });
  }
} 