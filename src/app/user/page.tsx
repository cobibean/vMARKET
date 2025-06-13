"use client";
import { useState, useEffect } from 'react';
import { useActiveAccount } from "thirdweb/react";
import { fetchUserMarkets, batchClaimWinnings, type UserMarket } from "@/app/lib/api";
import { UserMarketCard } from "@/app/user/UserMarketCard";
import { MarketCardSkeleton } from "@/app/usdc/components/skeletonCard";
import { useToast } from "@/app/ui/useToast";
import { Button } from "@/app/ui/button";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { truncateAddress, formatPrice } from '@/lib/utils';

// Disable static generation to prevent ThirdwebProvider errors during build
export const dynamic = 'force-dynamic';

export default function UserProfilePage() {
  const { toast } = useToast();
  const account = useActiveAccount();
  const [userMarkets, setUserMarkets] = useState<UserMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimableMarkets, setClaimableMarkets] = useState<number[]>([]);

  const userId = account?.address ?? '';

  useEffect(() => {
    if (userId) {
      const loadData = async () => {
        try {
          setIsLoading(true);
          // Add error logging and validation
          const markets = await fetchUserMarkets(userId.toLowerCase()); // Many chains need lowercase
          const claimable = markets
            .filter(m => !m.claimed)
            .map(m => m.market_id);
            
          if (markets.length === 0) {
            toast({ title: "No predictions found for this account" });
          }
          
          setClaimableMarkets(claimable);
          setUserMarkets(markets);
        } catch (error) {
          console.error("Market fetch error:", error);
          toast({
            variant: "destructive", 
            title: "Market Load Failed",
            description: (error as Error).message || "Check console for details"
          });
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    }
  }, [userId, toast]);

  const handleClaim = async (marketId: number) => {
    if (!userId) {
      toast({ variant: "destructive", title: "Connect wallet to claim" });
      return;
    }

    try {
      await batchClaimWinnings(userId, [marketId]);
      setUserMarkets(prev => 
        prev.map(m => m.market_id === marketId ? { ...m, claimed: true } : m)
      );
      toast({ title: "Successfully claimed!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Claim failed" });
    }
  };

  const handleClaimAll = async () => {
    if (!userId || claimableMarkets.length === 0) {
      toast({ variant: "destructive", title: "Nothing to claim" });
      return;
    }

    try {
      await batchClaimWinnings(userId, claimableMarkets);
      setUserMarkets(prev => 
        prev.map(m => claimableMarkets.includes(m.market_id) ? { ...m, claimed: true } : m)
      );
      toast({ title: "Successfully claimed all!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Batch claim failed" });
    }
  };

  // Mock user data (in a real app this would come from auth context)
  const mockUser = {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    balance: 1250.75,
    marketsCreated: 3,
    predictions: 12,
    winningPredictions: 8,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mockUser.address);
    // In a real app, would show a toast notification here
    alert('Address copied to clipboard');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">User Profile</h1>
        <p className="text-muted-foreground">Manage your account and view your prediction history</p>
      </div>

      {/* Account Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-lg">{truncateAddress(mockUser.address)}</p>
                <Button variant="ghost" size="sm" className="h-7" onClick={copyToClipboard}>
                  Copy
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Balance</p>
              <p className="text-lg font-semibold">{formatPrice(mockUser.balance)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Markets Created</p>
              <p className="text-3xl font-bold text-primary">{mockUser.marketsCreated}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Predictions</p>
              <p className="text-3xl font-bold text-primary">{mockUser.predictions}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Win Rate</p>
              <p className="text-3xl font-bold text-primary">
                {(mockUser.winningPredictions / mockUser.predictions * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button>Deposit</Button>
            <Button variant="outline">Withdraw</Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Positions Section */}
      <div>
        <h2 className="text-2xl font-heading font-semibold mb-4">Active Positions</h2>
        <div className="text-center p-8 bg-muted rounded-lg">
          <p className="text-muted-foreground">You don't have any active positions yet.</p>
          <Button className="mt-4" onClick={() => window.location.href = '/open'}>
            Browse Markets
          </Button>
        </div>
      </div>

      {/* Transaction History Section */}
      <div>
        <h2 className="text-2xl font-heading font-semibold mb-4">Transaction History</h2>
        <div className="text-center p-8 bg-muted rounded-lg">
          <p className="text-muted-foreground">Your transaction history will appear here.</p>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">My Predictions</h1>
        {claimableMarkets.length > 0 && (
          <Button 
            onClick={handleClaimAll}
            className="mb-4"
          >
            Claim All ({claimableMarkets.length})
          </Button>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <MarketCardSkeleton key={i} />
            ))
          ) : userMarkets.length === 0 ? (
            <p className="text-muted-foreground">No active predictions</p>
          ) : (
            userMarkets.map(market => (
              <UserMarketCard
                key={`${market.room}-${market.market_id}`}
                market={market}
                onClaimSuccess={handleClaim}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}