"use client";

import React, { useEffect, useState } from 'react';
import { MarketCard } from '@/components/market/MarketCard';
import { useMarketsStore } from '@/state/useMarketsStore';
import { Button } from '@/components/shared/Button';
import { Market } from '@/state/useMarketsStore';
import { isConstructionMode } from '@/lib/construction-mode';
import { ConstructionLanding } from '@/components/construction/ConstructionLanding';

export default function OpenMarketsPage() {
  // If construction mode is enabled, show construction landing
  if (isConstructionMode()) {
    return <ConstructionLanding />;
  }
  const { markets, isLoading, error, fetchMarkets, selectMarket, filterMarketsByStatus } = useMarketsStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Get all categories from markets
  const categories = [...new Set(markets.map((market: Market) => market.category))];
  
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);
  
  const handleMarketClick = (id: string) => {
    selectMarket(id);
    // Navigate to market detail in the future
  };
  
  // Filter active markets
  const activeMarkets = filterMarketsByStatus('active');
  
  // Apply category filter if selected
  const filteredMarkets = activeCategory 
    ? activeMarkets.filter((market: Market) => market.category === activeCategory)
    : activeMarkets;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Open Markets</h1>
        <p className="text-muted-foreground">Active prediction markets ready for trading</p>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={activeCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory(null)}
        >
          All Categories
        </Button>
        {(categories as string[]).map((category: string) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      
      {/* Markets Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading markets...</div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">
          Error loading markets: {error}
        </div>
      ) : filteredMarkets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No active markets found{activeCategory ? ` in category "${activeCategory}"` : ''}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMarkets.map((market: Market) => (
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