import { google } from 'googleapis';

// Get credentials from the existing JSON file
const getGoogleCredentials = () => {
  const credentials = {
    type: "service_account",
    project_id: "quiet-terminal-462706-f3",
    private_key_id: "9fedd597f0500eec5bf5a711c984a55405f54edb",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3mme0w3XPCtFB\nVRIBHLCISDhc3FkZOgDdoXqaGKAmBuyVTsc/pl2boVZXE4DBiXk5LlXTQDtsZwZ2\nkbzlkSeMXi8uOz8t8joJWHIybetpnjY/jUUNKJThWTeF2+xqqlHTaAQhTM4Q0kxh\nAEnmsrsjI7QGvq8EvAhq08L3b3yJRiPs7bj8++p29C2a6xZGjstxnx1C0UIVJ2pq\nfcwb/KojHgIsh62Zh3NDQ6JIzhdBlEVyUM4sic7CV3MW1sGuoz6NHDBlc58zC78A\nGsI6q22oCtZ0uh870AwpdBO/feq15VK/JiOMZbM/bMW2zAboEEaSeRjZ7/2qYwht\nXtKO6dw3AgMBAAECggEADpLQ/IYvSbngFkF8Zl4ynP6uiqBq6heyjeUNaEHgJGSU\nTt2r7x9zerD5u3uu0q3o02McKOKGVPpwhuTWi5pT+05WjGLjhvAdLzS4C8yxzPZj\n8/NwsbSw7Jo6UAO+5lCSoic1fLct/CPVMDXnp8o0FHv3BDoKhmOuf1xDs4RD7Flk\netT6mvIOm/EaRMLHTezYrO+vgSrLQmL6xsAuslzoLecVRnnlJ9wgaDpbpUSsc2E0\nli/0CtNGoVxSSFmpn7wU9bJuvVO30aboS+iXfscWtOKmYs79VfCGePJ3ZbBEiELx\nKcfvLk+BceYFLzx8FxNoSV1uyWeVGTzFHS7N2kwW4QKBgQDhi6CwvFw0FB9nMLrR\nRgyVZ0YN92QihA6BLD3Jts+kpF+MQK2PP5L5qWEL0FC0kB6C81Epo/OH7lz6IMwm\nPvr10eS6RdU+XtHxSA0gvSaIYetNF1j3CkHQ3UFWjX+bQl9S/dfr5pFoBUvQgSpS\nd/fWTmCtgCAenx29p+rPtSssPwKBgQDQZPgey5DGIkeG1v5dksJBXq3hF4rTho3h\nL4moT4rK5KYXjf8k3AILWWFD6V20+QfrqsVEI3DnB80EsI6YN8RmK76skEqQM6k4\nw4ZtD797qqU7V2gKIO3H32TR20xyqTCxq2bGpTR3QHRE+CIVHI741w5GNDIr+JOe\nuqFukf8yCQKBgDeNeqDNZDB3nFyARiNxi3vpGfoqqwFNYX0zdmyOmIpG6jnTXGxi\nDkNsErkkMBypOrqqT51gAoXCkigRl/b7oDiX4Cx5MtLP7Anv4zvjGvCQnbI5Q/Jl\nFlzpgkRdScbmDDCW0W4LNllWpJvQlKoHXoXsfCd/3Wlta5fhGhba2q1lAoGAV9A0\nPcXJ27PWMBuoVAXjlWgwHQmuljO81YcSmrnp4lU3J/XN7dpHgkDHm7ZapkfJ7qSn\nO28zxCalXbSIYdweBm+oiU7EHL+oLyM1If/g0Fu4BKlwTdRSXkbkVQnzzN0+h5+S\nT2KOGTIvzGBC/GJsXK9CdJLKEX1NtzUtkUo0HwECgYAmqOUpjn+SVEEFps3S3M3N\nmDb/PdkSZKbdD/Cv09PMbRZKf5nXSVAhB9mbkTRfh+eqBynaDoapZI6XTMTZKnfw\nxPKEd5CU/eGyZ4SF4RGxrU4wICBrnSISDCnrvO+8vg+3b87dMS2NVY+nCU2V9uk3\nr4r/xMU5l7gWNC9ET6gIRA==\n-----END PRIVATE KEY-----\n",
    client_email: "vmarketvic@quiet-terminal-462706-f3.iam.gserviceaccount.com",
    client_id: "110116817946411995604",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/vmarketvic%40quiet-terminal-462706-f3.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  };

  return credentials;
};

// Create authenticated Google Sheets client
export const getSheetsClient = async () => {
  const credentials = getGoogleCredentials();
  
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  return sheets;
};

// Add email to Google Sheets
export const addEmailToSheet = async (
  spreadsheetId: string,
  email: string,
  source: string = 'landing-page'
) => {
  try {
    const sheets = await getSheetsClient();
    
    // First, ensure headers exist
    await ensureHeaders(sheets, spreadsheetId);
    
    // Add the email data
    const values = [
      [email, source, new Date().toISOString()]
    ];

    const result = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error('Error adding email to sheet:', error);
    throw error;
  }
};

// Ensure the sheet has proper headers
const ensureHeaders = async (sheets: any, spreadsheetId: string) => {
  try {
    // Check if headers already exist
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!1:1',
    });

    if (!response.data.values || response.data.values.length === 0) {
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1:C1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Email', 'Source', 'Date Added']],
        },
      });
    }
  } catch (error) {
    console.error('Error ensuring headers:', error);
    // If sheet doesn't exist, this will fail, but that's okay
  }
};

// Get all emails from sheet (for admin view)
export const getEmailsFromSheet = async (
  spreadsheetId: string,
  limit: number = 100,
  offset: number = 0
) => {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:C',
    });

    const rows = response.data.values || [];
    
    // Remove header row and apply pagination
    const dataRows = rows.slice(1);
    const total = dataRows.length;
    const paginatedRows = dataRows.slice(offset, offset + limit);
    
    const emails = paginatedRows.map((row, index) => ({
      id: offset + index + 1,
      email: row[0] || '',
      source: row[1] || 'unknown',
      created_at: row[2] || new Date().toISOString(),
    }));

    return {
      success: true,
      data: emails,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error getting emails from sheet:', error);
    throw error;
  }
};

// Create a new spreadsheet for email collection
export const createEmailSpreadsheet = async (title: string = 'vMARKET Email Collection') => {
  try {
    const sheets = await getSheetsClient();
    
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
        sheets: [
          {
            properties: {
              title: 'Sheet1',
            },
          },
        ],
      },
    });

    const spreadsheetId = response.data.spreadsheetId!;
    
    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1:C1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Email', 'Source', 'Date Added']],
      },
    });

    return {
      success: true,
      spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    };
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    throw error;
  }
}; 