"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import marketVestaABI from '../../../vesta/constants/marketVestaABI';

interface ManualCreationProps {
  address: string;
}

interface Option {
  id: string;
  value: string;
}

// Contract address - should be in an environment variable in production
const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5";

export default function ManualCreation({ address }: ManualCreationProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<Option[]>([
    { id: '1', value: '' },
    { id: '2', value: '' },
  ]);
  const [duration, setDuration] = useState('86400'); // Default to 24 hours in seconds
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [marketCreated, setMarketCreated] = useState(false);

  // Add a new option
  const addOption = () => {
    if (options.length >= 10) {
      setError('Maximum of 10 options allowed');
      return;
    }
    
    const newId = String(options.length + 1);
    setOptions([...options, { id: newId, value: '' }]);
  };

  // Remove an option
  const removeOption = (id: string) => {
    if (options.length <= 2) {
      setError('Minimum of 2 options required');
      return;
    }
    
    setOptions(options.filter(option => option.id !== id));
    setError('');
  };

  // Update option value
  const updateOption = (id: string, value: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, value } : option
    ));
  };

  // Create market directly through connected wallet
  const handleCreateMarket = async () => {
    // Form validation
    if (!question.trim()) {
      setError('Market question is required');
      return;
    }

    const optionValues = options.map(opt => opt.value.trim());
    
    if (optionValues.some(val => !val)) {
      setError('All options must have a value');
      return;
    }
    
    if (new Set(optionValues).size !== optionValues.length) {
      setError('All options must be unique');
      return;
    }

    setLoading(true);
    setStatus('Creating market...');
    setError('');
    setMarketCreated(false);

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to create markets.');
      }

      // Connect to the Ethereum provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Ensure connected wallet matches the address
      const connectedAddress = await signer.getAddress();
      if (connectedAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Connected wallet address does not match. Please connect the correct wallet.');
      }

      // Create contract instance
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        marketVestaABI,
        signer
      );

      // Create market
      const durationInSeconds = parseInt(duration);
      const tx = await contract.createMarket(
        question,
        optionValues,
        durationInSeconds
      );

      setStatus('Transaction submitted. Waiting for confirmation...');
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Market created:', receipt);

      setMarketCreated(true);
      setStatus('Market created successfully!');
      
      // Reset form
      setQuestion('');
      setOptions([
        { id: '1', value: '' },
        { id: '2', value: '' },
      ]);
      setDuration('86400');
    } catch (err: any) {
      console.error('Error creating market:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error creating market. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <p className="text-sm text-gray-600">
          This method creates a custom market with your specified question and options.
          All markets will be created using your connected wallet and require transaction approval.
        </p>
      </div>

      {/* Market Question */}
      <div className="mb-4">
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
          Market Question
        </label>
        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., Who will win the Champions League final?"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      {/* Market Options */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Market Options
          </label>
          <button
            type="button"
            onClick={addOption}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Option
          </button>
        </div>
        
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <input
                type="text"
                value={option.value}
                onChange={(e) => updateOption(option.id, e.target.value)}
                placeholder={`Option ${option.id}`}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                className="text-red-600 hover:text-red-800"
                aria-label="Remove option"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Duration Selection */}
      <div className="mb-6">
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
          Market Duration
        </label>
        <select
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="3600">1 hour</option>
          <option value="7200">2 hours</option>
          <option value="14400">4 hours</option>
          <option value="28800">8 hours</option>
          <option value="43200">12 hours</option>
          <option value="86400">24 hours</option>
          <option value="172800">2 days</option>
          <option value="259200">3 days</option>
          <option value="604800">1 week</option>
          <option value="1209600">2 weeks</option>
        </select>
      </div>

      {/* Create Button */}
      <div>
        <button
          onClick={handleCreateMarket}
          disabled={loading}
          className="flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-blue-400 w-full"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Market...
            </>
          ) : 'Create Market'}
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
      {marketCreated && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-700">
            Market created successfully! Visit the Markets page to view it.
          </p>
        </div>
      )}
    </div>
  );
} 