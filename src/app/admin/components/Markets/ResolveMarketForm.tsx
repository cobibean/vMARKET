import React, { useState } from 'react';
import { Market } from '../Dashboard/types';
import { ActionButton, ErrorDisplay } from '../shared';

interface ResolveMarketFormProps {
  marketId: number;
  markets: Market[];
  onResolve: (marketId: number, outcome: number) => Promise<void>;
  onClose: () => void;
}

export default function ResolveMarketForm({
  marketId,
  markets,
  onResolve,
  onClose
}: ResolveMarketFormProps) {
  const [winningOutcome, setWinningOutcome] = useState<number>(0);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const market = markets.find(m => m.id === marketId);
  
  if (!market) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Error</h2>
          <p>Market not found.</p>
          <div className="mt-6 flex justify-end">
            <ActionButton onClick={onClose} variant="secondary">
              Close
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  const handleResolve = async () => {
    try {
      setError(null);
      setIsResolving(true);
      await onResolve(marketId, winningOutcome);
      onClose();
    } catch (err) {
      setError('Failed to resolve market. Please try again.');
      console.error(err);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Resolve Market</h2>
        
        <div className="mb-4">
          <p className="font-medium mb-2">Question:</p>
          <p className="mb-4">{market.question}</p>
          
          <p className="font-medium mb-2">Select winning outcome:</p>
          <div className="space-y-2">
            {market.outcomes.map((outcome, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`outcome-${index}`}
                  name="outcome"
                  value={index}
                  checked={winningOutcome === index}
                  onChange={() => setWinningOutcome(index)}
                  className="mr-2"
                />
                <label htmlFor={`outcome-${index}`}>{outcome}</label>
              </div>
            ))}
          </div>
        </div>
        
        {error && <ErrorDisplay message={error} className="mb-4" />}
        
        <div className="flex justify-end space-x-2">
          <ActionButton onClick={onClose} variant="secondary" disabled={isResolving}>
            Cancel
          </ActionButton>
          <ActionButton 
            onClick={handleResolve} 
            variant="success" 
            disabled={isResolving}
          >
            {isResolving ? 'Resolving...' : 'Confirm Resolution'}
          </ActionButton>
        </div>
      </div>
    </div>
  );
} 