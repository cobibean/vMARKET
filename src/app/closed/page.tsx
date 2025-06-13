"use client";

import React, { useEffect } from 'react';
import { MarketCard } from '@/components/market/MarketCard';
import { useMarketsStore } from '@/state/useMarketsStore';
import { Market } from '@/state/useMarketsStore';
import { isConstructionMode } from '@/lib/construction-mode';
import { ConstructionLanding } from '@/components/construction/ConstructionLanding';

export default function ClosedMarketsPage() {
  // If construction mode is enabled, show construction landing
  if (isConstructionMode()) {
    return <ConstructionLanding />;
  }
  const { isLoading, error, fetchMarkets, selectMarket, filterMarketsByStatus } = useMarketsStore();
  
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);
  
  const handleMarketClick = (id: string) => {
    selectMarket(id);
    // Navigate to market detail in the future
  };
  
  // Get resolved markets
  const resolvedMarkets = filterMarketsByStatus('resolved');
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Closed Markets</h1>
        <p className="text-muted-foreground">
          Historical markets that have been resolved
        </p>
      </div>
      
      {/* Markets Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading markets...</div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          Error loading markets: {error}
        </div>
      ) : resolvedMarkets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No resolved markets found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resolvedMarkets.map((market: Market) => (
            <MarketCard
              key={market.id}
              id={market.id}
              title={market.title}
              description={market.description}
              outcomes={market.outcomes}
              status={market.status}
              endTime={market.endTime}
              volume={market.volume}
              liquidity={market.liquidity}
              createdBy={market.createdBy}
              onCardClick={handleMarketClick}
            />
          ))}
        </div>
      )}
    </div>
  );
} 