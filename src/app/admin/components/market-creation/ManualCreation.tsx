"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import marketVestaABI from '../../../vesta/constants/marketVestaABI';

interface ManualCreationProps {
  address: string;
}

// Contract address - should be in an environment variable in production
const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5";

export default function ManualCreation({ address }: ManualCreationProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [durationDays, setDurationDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [marketId, setMarketId] = useState<number | null>(null);

  // Add new option field
  const addOption = () => {
    if (options.length < 8) {
      setOptions([...options, '']);
    } else {
      setError('Maximum 8 options allowed');
    }
  };

  // Remove option field
  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    } else {
      setError('Minimum 2 options required');
    }
  };

  // Update option value
  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Create market directly through connected wallet
  const createMarket = async () => {
    // Validate inputs
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError('At least 2 valid options are required');
      return;
    }

    if (durationDays < 1) {
      setError('Duration must be at least 1 day');
      return;
    }

    setLoading(true);
    setStatus('Creating market...');
    setError('');
    setMarketId(null);

    try {
      // Calculate duration in seconds
      const durationSeconds = durationDays * 24 * 60 * 60;

      // Connect to wallet and contract
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, signer);

      // Check if address has creator role
      const creatorRole = await contract.MARKET_CREATOR_ROLE();
      const hasRole = await contract.hasRole(creatorRole, address);

      if (!hasRole) {
        throw new Error('Your wallet does not have permission to create markets');
      }

      // Create the market
      const tx = await contract.createMarket(question, validOptions, durationSeconds);
      setStatus('Transaction submitted. Waiting for confirmation...');
      
      // Wait for the transaction to be confirmed
      const receipt = await tx.wait();
      
      // Extract marketId from transaction logs
      let newMarketId = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog?.name === 'MarketCreated') {
            newMarketId = parsedLog.args.marketId;
            break;
          }
        } catch (err) {
          // Skip logs that can't be parsed
        }
      }

      if (newMarketId !== null) {
        setMarketId(Number(newMarketId));
        setStatus(`Market created successfully with ID: ${newMarketId}`);
        
        // Reset form
        setQuestion('');
        setOptions(['', '']);
        setDurationDays(7);
      } else {
        setStatus('Market created, but could not retrieve market ID');
      }
    } catch (err: any) {
      console.error('Error creating market:', err);
      setError(err.message || 'Error creating market. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <p className="text-sm text-gray-600">
          This method allows you to create custom markets manually. Enter a question, 
          add two or more options, set the duration, and click "Create Market".
        </p>
      </div>

      {/* Market Question */}
      <div className="mb-6">
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
          Market Question
        </label>
        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., Who will win the 2024 Super Bowl?"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      {/* Market Options */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Market Options
        </label>
        
        {options.map((option, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-2 rounded-r-md border border-l-0 border-gray-300"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={addOption}
          className="mt-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-1 px-3 rounded-md border border-gray-300"
        >
          + Add Option
        </button>
      </div>

      {/* Market Duration */}
      <div className="mb-6">
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
          Duration (days)
        </label>
        <input
          type="number"
          id="duration"
          min="1"
          max="365"
          value={durationDays}
          onChange={(e) => setDurationDays(parseInt(e.target.value) || 7)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      {/* Action Button */}
      <div>
        <button
          onClick={createMarket}
          disabled={loading}
          className="w-full sm:w-auto flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md disabled:bg-blue-400"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : 'Create Market'}
        </button>
      </div>

      {/* Status Display */}
      {status && !error && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-blue-700">{status}</p>
          {marketId !== null && (
            <p className="text-blue-700 mt-2">Market ID: {marketId}</p>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
} 