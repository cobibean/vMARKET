// app/page.tsx

"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarketCard } from '@/components/market/MarketCard';
import { useMarketsStore } from '@/state/useMarketsStore';
import { Button } from '@/components/shared/Button';
import { isConstructionMode } from '@/lib/construction-mode';
import { ConstructionLanding } from '@/components/construction/ConstructionLanding';

export default function Home() {
  // If construction mode is enabled, show construction landing
  if (isConstructionMode()) {
    return <ConstructionLanding />;
  }

  return <OriginalHomepage />;
}

function OriginalHomepage() {
  const router = useRouter();
  const { 
    markets, 
    isLoading, 
    error, 
    fetchMarkets, 
    selectMarket, 
    filterMarketsByStatus 
  } = useMarketsStore();

  useEffect(() => {
    // Fetch markets when component mounts
    fetchMarkets();
  }, [fetchMarkets]);

  const handleMarketClick = (id: string) => {
    selectMarket(id);
    // Navigate to market detail (to be implemented)
    // router.push(`/market/${id}`);
  };

  // Get active markets for the featured section
  const activeMarkets = filterMarketsByStatus('active');
  const featuredMarkets = activeMarkets.slice(0, 3);

  // Get pending markets
  const pendingMarkets = filterMarketsByStatus('pending').slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
          Welcome to <span className="text-primary">vMARKET</span>
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          The premier prediction markets platform for trading on real-world outcomes
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => router.push('/open')}>
            Explore Markets
          </Button>
          <Button size="lg" variant="outline">
            Create Market
          </Button>
        </div>
      </section>

      {/* Featured Markets */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading font-bold">Featured Markets</h2>
          <Button variant="ghost" onClick={() => router.push('/open')}>
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading markets...</div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            Error loading markets: {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMarkets.map((market: any) => (
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
      </section>

      {/* Upcoming Markets */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-heading font-bold">Upcoming Markets</h2>
          <Button variant="ghost" onClick={() => router.push('/open')}>
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingMarkets.map((market: any) => (
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
      </section>

      {/* How It Works */}
      <section className="py-8 px-4 bg-muted rounded-lg">
        <h2 className="text-2xl font-heading font-bold mb-6 text-center">
          How vMARKET Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-card rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Choose a Market</h3>
            <p className="text-muted-foreground">
              Browse prediction markets on various topics and select one that interests you.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-card rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Place Your Prediction</h3>
            <p className="text-muted-foreground">
              Buy shares in your predicted outcome using cryptocurrency.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-card rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-lg font-bold mb-2">Collect Rewards</h3>
            <p className="text-muted-foreground">
              When the market resolves, collect rewards if your prediction was correct.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}