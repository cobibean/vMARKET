"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import marketVestaABI from '../../vesta/constants/marketVestaABI';

interface MarketResolutionProps {
  address: string;
}

interface Market {
  id: number;
  question: string;
  options: string[];
  endTime: number;
  resolved: boolean;
  outcome?: number;
}

// Contract address - should be in an environment variable in production
const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5";

export default function MarketResolution({ address }: MarketResolutionProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
  const [resolveMethod, setResolveMethod] = useState<'api' | 'manual'>('api');
  const [resolveDate, setResolveDate] = useState('');

  // Fetch markets from the contract
  const fetchMarkets = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Call API route to get all markets
      const response = await fetch('/api/admin/get-markets');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch markets');
      }
      
      setMarkets(data.markets);
    } catch (err: Error | unknown) {
      console.error('Error fetching markets:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error fetching markets. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load markets on component mount
  useEffect(() => {
    fetchMarkets();
  }, []);

  // Handle market selection
  const handleMarketSelect = (market: Market) => {
    setSelectedMarket(market);
    setSelectedOutcome(null);
    setSuccess('');
  };

  // Handle outcome selection
  const handleOutcomeSelect = (outcomeIndex: number) => {
    setSelectedOutcome(outcomeIndex);
    setSuccess('');
  };

  // Resolve markets via API
  const resolveMarketsViaAPI = async () => {
    if (!resolveDate) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call API route to resolve markets for a specific date
      const response = await fetch('/api/admin/resolve-markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: resolveDate,
          address, // Pass wallet address for authorization
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resolve markets');
      }

      setSuccess(`Successfully resolved ${data.count} markets for ${resolveDate}`);
      
      // Refetch markets to update the list
      fetchMarkets();
    } catch (err: Error | unknown) {
      console.error('Error resolving markets:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error resolving markets. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resolve market manually
  const resolveMarketManually = async () => {
    if (!selectedMarket || selectedOutcome === null) {
      setError('Please select a market and outcome');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Connect to wallet and contract
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, signer);

      // Check if address has resolver role
      const resolverRole = await contract.MARKET_RESOLVER_ROLE();
      const hasRole = await contract.hasRole(resolverRole, address);

      if (!hasRole) {
        throw new Error('Your wallet does not have permission to resolve markets');
      }

      // Resolve the market
      const tx = await contract.resolveMarket(selectedMarket.id, selectedOutcome);
      setSuccess('Transaction submitted. Waiting for confirmation...');
      
      // Wait for the transaction to be confirmed
      await tx.wait();
      
      setSuccess(`Market resolved successfully with outcome: ${selectedMarket.options[selectedOutcome]}`);
      
      // Refetch markets to update the list
      fetchMarkets();
      
      // Reset selection
      setSelectedMarket(null);
      setSelectedOutcome(null);
    } catch (err: Error | unknown) {
      console.error('Error resolving market:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error resolving market. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Resolve Markets</h3>

      {/* Resolution Method Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setResolveMethod('api')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm 
              ${resolveMethod === 'api' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            API Resolution (Sports)
          </button>
          <button
            onClick={() => setResolveMethod('manual')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${resolveMethod === 'manual' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Manual Resolution
          </button>
        </nav>
      </div>

      {/* API-based Resolution UI */}
      {resolveMethod === 'api' && (
        <div>
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-sm text-gray-600">
              This method resolves all markets for a specific date using our sports data API. 
              Select a date and click &quot;Resolve Markets&quot; to automatically resolve all markets 
              for games that occurred on that date.
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="resolveDate" className="block text-sm font-medium text-gray-700 mb-1">
              Event Date
            </label>
            <input
              type="date"
              id="resolveDate"
              value={resolveDate}
              onChange={(e) => setResolveDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <button
            onClick={resolveMarketsViaAPI}
            disabled={loading || !resolveDate}
            className="w-full sm:w-auto flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md disabled:bg-blue-400"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resolving...
              </>
            ) : 'Resolve Markets'}
          </button>
        </div>
      )}

      {/* Manual Resolution UI */}
      {resolveMethod === 'manual' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Market List */}
          <div className="md:col-span-1 border rounded-md overflow-hidden">
            <div className="bg-gray-50 p-3 border-b border-gray-200">
              <h4 className="font-medium text-gray-700">Markets</h4>
              <p className="text-xs text-gray-500 mt-1">
                Select a market to resolve
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading && markets.length === 0 ? (
                <div className="flex justify-center items-center p-6">
                  <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : markets.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No markets found
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {markets.map((market) => (
                    <li key={market.id}>
                      <button
                        onClick={() => handleMarketSelect(market)}
                        className={`w-full text-left p-3 hover:bg-gray-50 ${
                          selectedMarket?.id === market.id ? 'bg-blue-50' : ''
                        }`}
                        disabled={market.resolved}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 truncate mr-2">
                            <span className={`block font-medium ${market.resolved ? 'text-gray-400' : 'text-gray-700'}`}>
                              {market.question}
                            </span>
                            <span className="block text-xs text-gray-500 mt-1">
                              ID: {market.id}
                            </span>
                          </div>
                          {market.resolved && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Resolved
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Resolution Panel */}
          <div className="md:col-span-2">
            {selectedMarket ? (
              <div className="bg-white rounded-md border p-4">
                <h4 className="font-medium text-gray-800 mb-3">{selectedMarket.question}</h4>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Select the winning outcome:</p>
                  <div className="space-y-2">
                    {selectedMarket.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleOutcomeSelect(index)}
                        className={`block w-full text-left px-4 py-2 rounded-md border ${
                          selectedOutcome === index
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedMarket(null)}
                    className="mr-3 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={resolveMarketManually}
                    disabled={loading || selectedOutcome === null}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:bg-blue-400"
                  >
                    {loading ? 'Resolving...' : 'Resolve Market'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-md border border-dashed p-8 flex flex-col items-center justify-center text-center">
                <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="text-gray-600 font-medium mb-1">No Market Selected</h4>
                <p className="text-sm text-gray-500">
                  Select a market from the list to resolve it.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-700">{success}</p>
        </div>
      )}
    </div>
  );
} 