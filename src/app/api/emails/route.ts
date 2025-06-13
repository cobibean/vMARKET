import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Create emails table if it doesn't exist
async function ensureEmailTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS emails (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        source VARCHAR(50) DEFAULT 'landing-page'
      )
    `;
  } catch (error) {
    console.error('Error creating emails table:', error);
  }
}

// POST - Add new email
export async function POST(request: NextRequest) {
  try {
    const { email, source = 'landing-page' } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Ensure table exists
    await ensureEmailTable();

    // Insert email (ON CONFLICT DO NOTHING prevents duplicates)
    const result = await sql`
      INSERT INTO emails (email, source)
      VALUES (${email}, ${source})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, created_at
    `;

    if (result.rows.length === 0) {
      // Email already exists
      return NextResponse.json({
        success: true,
        message: 'Email already registered',
        alreadyExists: true
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email successfully added to waitlist',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error adding email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add email' },
      { status: 500 }
    );
  }
}

// GET - Retrieve emails (admin only)
export async function GET(request: NextRequest) {
  try {
    // Ensure table exists
    await ensureEmailTable();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await sql`
      SELECT id, email, created_at, source
      FROM emails
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const countResult = await sql`SELECT COUNT(*) as total FROM emails`;
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
} 