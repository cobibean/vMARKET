"use client";

import { Badge } from "@/app/ui/badge";
import { useMemo } from "react";
import { toFixed } from "@/app/lib/utils";

interface MarketSharesDisplayProps {
  market: {
    question: string;
    options: string[];
    totalShares: readonly bigint[];
  };
  sharesBalance: readonly bigint[];
}

// Helper to convert raw 18-decimal VESTA shares to a human-readable number
function toVesta(value: bigint): number {
  return Number(value) / 1_000_000_000_000_000_000; // 1e18
}

export function MarketSharesDisplay({
  market,
  sharesBalance,
}: MarketSharesDisplayProps) {
  // Calculate winnings using useMemo for performance optimization
  const winnings = useMemo(() => {
    if (!sharesBalance || !market) return [];

    return market.options.map((_, index) => {
      const userShares = sharesBalance[index] || BigInt(0);
      const totalSharesForOption = market.totalShares[index] || BigInt(0);

      // Sum of losing shares
      const totalLosingShares = market.totalShares.reduce(
        (sum, shares, idx) => (idx !== index ? sum + shares : sum),
        BigInt(0)
      );

      if (totalSharesForOption === BigInt(0)) return BigInt(0);

      // Calculate userProportion and winnings
      const userProportion =
        (userShares * BigInt(1_000_000_000_000_000_000)) / totalSharesForOption;
      const winningsFromLosingShares =
        (totalLosingShares * userProportion) / BigInt(1_000_000_000_000_000_000);

      return userShares + winningsFromLosingShares;
    });
  }, [sharesBalance, market.totalShares]);

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full text-sm text-muted-foreground">
        Your shares:
        {market.options.map((option, index) => {
          const rawShares = sharesBalance[index] || BigInt(0);
          const displayShares = toVesta(rawShares);

          return (
            <span key={index} className="block">
              {option} - {toFixed(displayShares, 2)}
            </span>
          );
        })}
      </div>

      {winnings.some((win) => win > 0) && (
        <div className="flex flex-col gap-1">
          <div className="text-xs text-muted-foreground">Winnings:</div>
          <div className="flex gap-2 flex-wrap">
            {market.options.map((option, index) => {
              const rawWin = winnings[index] || BigInt(0);
              const displayWin = toVesta(rawWin);

              return (
                <Badge key={index} variant="secondary">
                  {option}: {toFixed(displayWin, 2)} shares
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}