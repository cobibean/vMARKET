import React, { useState } from 'react';
import { Market } from '../Dashboard/types';
import MarketTable from './MarketTable';
import CreateMarketForm from './CreateMarketForm';
import ResolveMarketForm from './ResolveMarketForm';
import { ActionButton, LoadingSpinner, ErrorDisplay } from '../shared';

interface MarketListProps {
  markets: Market[];
  onRefreshMarkets: () => Promise<void>;
  onCreateMarket: (question: string, outcomes: string[], endTime: number) => Promise<boolean | void>;
  onResolveMarket: (marketId: number, outcome: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function MarketList({
  markets,
  onRefreshMarkets,
  onCreateMarket,
  onResolveMarket,
  isLoading,
  error
}: MarketListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  
  const handleResolveClick = (marketId: number) => {
    setSelectedMarketId(marketId);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Markets</h2>
        <ActionButton
          onClick={() => setShowCreateForm(true)}
          variant="primary"
        >
          Create Market
        </ActionButton>
      </div>
      
      {error && <ErrorDisplay message={error} />}
      
      {isLoading ? (
        <LoadingSpinner message="Loading markets..." />
      ) : markets.length === 0 ? (
        <p className="text-center py-4">No markets found.</p>
      ) : (
        <MarketTable 
          markets={markets} 
          onResolveClick={handleResolveClick} 
        />
      )}
      
      <div className="mt-6">
        <ActionButton
          onClick={onRefreshMarkets}
          variant="secondary"
        >
          Refresh Markets
        </ActionButton>
      </div>
      
      {showCreateForm && (
        <CreateMarketForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            onRefreshMarkets();
          }}
          onCreateMarket={onCreateMarket}
        />
      )}
      
      {selectedMarketId !== null && (
        <ResolveMarketForm
          marketId={selectedMarketId}
          markets={markets}
          onResolve={onResolveMarket}
          onClose={() => setSelectedMarketId(null)}
        />
      )}
    </div>
  );
} 