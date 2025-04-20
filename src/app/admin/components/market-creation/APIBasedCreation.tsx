"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import marketVestaABI from '../../../vesta/constants/marketVestaABI';

interface APIBasedCreationProps {
  address: string;
}

type League = 'CL' | 'NFL' | 'NBA' | 'EPL';

// Contract address - should be in an environment variable in production
const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5";

export default function APIBasedCreation({ address }: APIBasedCreationProps) {
  const [selectedLeague, setSelectedLeague] = useState<League>('CL');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [gamesFetched, setGamesFetched] = useState(false);
  const [marketsCreated, setMarketsCreated] = useState(false);

  const leagues = [
    { id: 'CL', name: 'Champions League' },
    { id: 'NFL', name: 'NFL' },
    { id: 'NBA', name: 'NBA' },
    { id: 'EPL', name: 'Premier League' },
  ];

  // Handle fetching games from sports API
  const handleFetchGames = async () => {
    if (!date) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setStatus('Fetching games...');
    setError('');
    setGamesFetched(false);
    setMarketsCreated(false);

    try {
      // Call API route to fetch games from SportMonks
      const response = await fetch(`/api/admin/fetch-games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          league: selectedLeague,
          date,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch games');
      }

      setGamesFetched(true);
      setStatus(`Successfully fetched ${data.count} games for ${selectedLeague} on ${date}`);
    } catch (err: any) {
      console.error('Error fetching games:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error fetching games. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle creating markets from fetched games
  const handleCreateMarkets = async () => {
    if (!gamesFetched) {
      setError('Please fetch games first');
      return;
    }

    setLoading(true);
    setStatus('Creating markets...');
    setError('');
    setMarketsCreated(false);

    try {
      // Call API route to create markets for fetched games
      const response = await fetch(`/api/admin/create-markets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          league: selectedLeague,
          date,
          address, // Pass wallet address for authorization
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create markets');
      }

      setMarketsCreated(true);
      setStatus(`Successfully created ${data.count} markets for ${selectedLeague} on ${date}`);
    } catch (err: any) {
      console.error('Error creating markets:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error creating markets. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <p className="text-sm text-gray-600">
          This method creates markets by fetching games from our sports data API. 
          Select a league, enter a date, and click &quot;Fetch Games&quot; to retrieve available games. 
          Then click &quot;Create Markets&quot; to create markets for those games.
        </p>
      </div>

      {/* League Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          League
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {leagues.map((league) => (
            <button
              key={league.id}
              type="button"
              onClick={() => setSelectedLeague(league.id as League)}
              className={`
                py-2 px-4 rounded-md text-sm font-medium
                ${selectedLeague === league.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}
              `}
            >
              {league.name}
            </button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-6">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Game Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
        <button
          onClick={handleFetchGames}
          disabled={loading || !date}
          className="flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-blue-400"
        >
          {loading && status === 'Fetching games...' ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Fetching...
            </>
          ) : '1. Fetch Games'}
        </button>
        
        <button
          onClick={handleCreateMarkets}
          disabled={loading || !gamesFetched}
          className="flex justify-center items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-green-400"
        >
          {loading && status === 'Creating markets...' ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : '2. Create Markets'}
        </button>
      </div>

      {/* Status Display */}
      {status && !error && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-700">{status}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {marketsCreated && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-700">
            Markets created successfully! Visit the Markets page to view them.
          </p>
        </div>
      )}
    </div>
  );
} 