import React, { useState } from 'react';
import { ActionButton, ErrorDisplay } from '../shared';

interface CreateMarketFormProps {
  onClose: () => void;
  onSuccess: () => void;
  onCreateMarket: (question: string, outcomes: string[], endTime: number) => Promise<boolean | void>;
}

export default function CreateMarketForm({
  onClose,
  onSuccess,
  onCreateMarket
}: CreateMarketFormProps) {
  const [newMarket, setNewMarket] = useState({
    question: '',
    outcomes: ['Yes', 'No'],
    endTime: ''
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateMarket = async () => {
    try {
      setCreating(true);
      setError(null);
      
      // Validate inputs
      if (!newMarket.question.trim()) {
        setError('Question is required');
        setCreating(false);
        return;
      }
      
      if (newMarket.outcomes.length < 2) {
        setError('At least two outcomes are required');
        setCreating(false);
        return;
      }
      
      if (!newMarket.endTime) {
        setError('End time is required');
        setCreating(false);
        return;
      }
      
      // Convert end time to timestamp
      const endTimestamp = Math.floor(new Date(newMarket.endTime).getTime() / 1000);
      
      if (endTimestamp <= Math.floor(Date.now() / 1000)) {
        setError('End time must be in the future');
        setCreating(false);
        return;
      }
      
      // Create market
      await onCreateMarket(
        newMarket.question,
        newMarket.outcomes,
        endTimestamp
      );
      
      // Close form and refresh markets
      onSuccess();
    } catch (err) {
      setError('Failed to create market. Please try again.');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const addOutcome = () => {
    setNewMarket({
      ...newMarket,
      outcomes: [...newMarket.outcomes, '']
    });
  };

  const updateOutcome = (index: number, value: string) => {
    const updatedOutcomes = [...newMarket.outcomes];
    updatedOutcomes[index] = value;
    setNewMarket({
      ...newMarket,
      outcomes: updatedOutcomes
    });
  };

  const removeOutcome = (index: number) => {
    if (newMarket.outcomes.length <= 2) {
      setError('At least two outcomes are required');
      return;
    }
    
    const updatedOutcomes = [...newMarket.outcomes];
    updatedOutcomes.splice(index, 1);
    setNewMarket({
      ...newMarket,
      outcomes: updatedOutcomes
    });
    
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Create New Market</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              type="text"
              value={newMarket.question}
              onChange={(e) => setNewMarket({...newMarket, question: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Will Bitcoin reach $100k in 2024?"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Outcomes
              </label>
              <button
                type="button"
                onClick={addOutcome}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                + Add Outcome
              </button>
            </div>
            
            {newMarket.outcomes.map((outcome, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => updateOutcome(index, e.target.value)}
                  className="flex-grow px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Outcome ${index + 1}`}
                />
                {newMarket.outcomes.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOutcome(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              value={newMarket.endTime}
              onChange={(e) => setNewMarket({...newMarket, endTime: e.target.value})}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {error && <ErrorDisplay message={error} className="mt-4" />}
        
        <div className="mt-6 flex justify-end space-x-2">
          <ActionButton onClick={onClose} variant="secondary" disabled={creating}>
            Cancel
          </ActionButton>
          <ActionButton
            onClick={handleCreateMarket}
            variant="primary"
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Market'}
          </ActionButton>
        </div>
      </div>
    </div>
  );
} 