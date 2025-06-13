import { NextRequest, NextResponse } from 'next/server';
import { addEmailToSheet, getEmailsFromSheet, createEmailSpreadsheet } from '@/lib/google-sheets';

// You'll need to set this environment variable with your spreadsheet ID
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_EMAIL_ID || '';

// POST - Add new email to Google Sheets
export async function POST(request: NextRequest) {
  try {
    const { email, source = 'landing-page' } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    if (!SPREADSHEET_ID) {
      return NextResponse.json(
        { success: false, error: 'Google Sheets not configured. Please set GOOGLE_SHEETS_EMAIL_ID environment variable.' },
        { status: 500 }
      );
    }

    // Add email to Google Sheets
    const result = await addEmailToSheet(SPREADSHEET_ID, email, source);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email successfully added to waitlist',
        data: {
          email,
          source,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      throw new Error('Failed to add email to sheet');
    }

  } catch (error) {
    console.error('Error adding email to Google Sheets:', error);
    
    // Check if it's a permission error
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json(
        { success: false, error: 'Google Sheets permission denied. Please check service account permissions.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add email to Google Sheets' },
      { status: 500 }
    );
  }
}

// GET - Retrieve emails from Google Sheets (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!SPREADSHEET_ID) {
      return NextResponse.json(
        { success: false, error: 'Google Sheets not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await getEmailsFromSheet(SPREADSHEET_ID, limit, offset);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching emails from Google Sheets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch emails from Google Sheets' },
      { status: 500 }
    );
  }
}

// PUT - Create a new Google Sheets spreadsheet for email collection
export async function PUT(request: NextRequest) {
  try {
    const { title } = await request.json();
    
    const result = await createEmailSpreadsheet(title || 'vMARKET Email Collection');

    return NextResponse.json({
      success: true,
      message: 'Google Sheets spreadsheet created successfully',
      spreadsheetId: result.spreadsheetId,
      url: result.url,
      instructions: [
        '1. Copy the spreadsheet ID from the URL above',
        '2. Add GOOGLE_SHEETS_EMAIL_ID=your_spreadsheet_id to your .env.local file',
        '3. Make sure to share the spreadsheet with your service account email: vmarketvic@quiet-terminal-462706-f3.iam.gserviceaccount.com',
        '4. Give the service account "Editor" permissions'
      ]
    });

  } catch (error) {
    console.error('Error creating Google Sheets spreadsheet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create Google Sheets spreadsheet' },
      { status: 500 }
    );
  }
} 