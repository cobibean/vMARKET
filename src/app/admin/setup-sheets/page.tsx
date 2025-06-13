'use client';

import React, { useState } from 'react';
import { Button } from '@/components/shared/Button';

export default function SetupSheetsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createSpreadsheet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/emails-sheets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'vMARKET Email Collection'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to create spreadsheet');
      }
    } catch (err) {
      setError('Error creating spreadsheet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Google Sheets Setup</h1>
          <p className="mt-2 text-gray-600">
            Set up Google Sheets integration for email collection
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create Email Collection Spreadsheet
          </h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This will create a new Google Sheets spreadsheet for collecting emails from your landing page.
            </p>
            
            <Button
              onClick={createSpreadsheet}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Creating Spreadsheet...' : 'Create Google Sheets Spreadsheet'}
            </Button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-green-800 font-medium mb-2">Success! Spreadsheet Created</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Spreadsheet URL:</strong>
                </p>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {result.url}
                </a>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Spreadsheet ID:</strong>
                </p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {result.spreadsheetId}
                </code>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Next Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  {result.instructions.map((instruction: string, index: number) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
                <h4 className="text-yellow-800 font-medium text-sm mb-1">Important:</h4>
                <p className="text-yellow-700 text-sm">
                  Add this to your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file:
                </p>
                <div className="mt-2">
                  <code className="bg-yellow-100 px-2 py-1 rounded text-sm block">
                    GOOGLE_SHEETS_EMAIL_ID={result.spreadsheetId}
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Manual Setup Instructions
          </h2>
          
          <div className="prose prose-sm text-gray-600">
            <p>If you prefer to set up manually:</p>
            
            <ol className="list-decimal list-inside space-y-3 mt-4">
              <li>
                <strong>Create a new Google Sheets document</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Go to <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">sheets.google.com</a></li>
                  <li>Create a new blank spreadsheet</li>
                  <li>Name it "vMARKET Email Collection" or similar</li>
                </ul>
              </li>
              
              <li>
                <strong>Share with service account</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Click "Share" in the top right</li>
                  <li>Add this email: <code className="bg-gray-100 px-1 rounded">vmarketvic@quiet-terminal-462706-f3.iam.gserviceaccount.com</code></li>
                  <li>Give it "Editor" permissions</li>
                </ul>
              </li>
              
              <li>
                <strong>Get the Spreadsheet ID</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Copy the ID from the URL (between /d/ and /edit)</li>
                  <li>Example: https://docs.google.com/spreadsheets/d/<code className="bg-gray-100 px-1 rounded">YOUR_SPREADSHEET_ID</code>/edit</li>
                </ul>
              </li>
              
              <li>
                <strong>Add to environment variables</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Add to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:</li>
                  <li><code className="bg-gray-100 px-1 rounded">GOOGLE_SHEETS_EMAIL_ID=your_spreadsheet_id_here</code></li>
                </ul>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 