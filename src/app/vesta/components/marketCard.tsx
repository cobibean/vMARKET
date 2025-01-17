"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/ui/card";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { contract } from "@/app/vesta/constants/contracts";
import { MarketProgress } from "./marketProgress";
import { MarketTime } from "./marketTime";
import { MarketCardSkeleton } from "./skeletonCard";
import { MarketSharesDisplay } from "./marketSharesDisplay";
import { MarketBuyInterface } from "./marketBuyInterface";
import { MarketResolved } from "./marketResolved";
import { MarketPending } from "./marketPending";
import { useMemo } from "react";

interface MarketCardProps {
  index: number;
  filter: "active" | "pending" | "resolved";
}

interface Market {
  question: string;
  options: string[];
  endTime: bigint;
  outcome: number;
  totalShares: readonly bigint[];
  resolved: boolean;
}

interface SharesBalance {
  shares: readonly bigint[];
}

export function MarketCard({ index, filter }: MarketCardProps) {
  const account = useActiveAccount();

  // --- 1. Fetch Market Data ---
  const { data: marketData, isLoading: isLoadingMarketData } = useReadContract({
    contract,
    method: "function getMarketInfo(uint256) view returns (string, string[], uint256, uint8, uint256[], bool)",
    params: [BigInt(index)],
  });

  const market: Market | undefined = marketData
    ? {
        question: marketData[0],
        options: marketData[1].filter((o: string) => o.length > 0),
        endTime: marketData[2],
        outcome: marketData[3],
        totalShares: marketData[4],
        resolved: marketData[5],
      }
    : undefined;

  // --- 2. Fetch User's Shares ---
  const { data: sharesBalanceData } = useReadContract({
    contract,
    method: "function getSharesBalance(uint256, address) view returns (uint256[])",
    params: [BigInt(index), account?.address || "0x0000000000000000000000000000000000000000"],
  });

  const sharesBalance: SharesBalance | undefined = sharesBalanceData
    ? { shares: sharesBalanceData }
    : undefined;

  // --- 3. Status Logic ---
  const isExpired = useMemo(() => {
    if (!market) return false;
    return new Date(Number(market.endTime) * 1000) < new Date();
  }, [market]);

  const isResolved = market?.resolved;

  const shouldShow = useMemo(() => {
    if (!market) return false;
    switch (filter) {
      case "active":
        return !isExpired; // Not expired => still active
      case "pending":
        return isExpired && !isResolved; // Expired but not resolved
      case "resolved":
        return isExpired && isResolved; // Expired + resolved
      default:
        return true;
    }
  }, [filter, isExpired, isResolved, market]);

  if (!shouldShow) {
    return null;
  }

  // --- 4. Render ---
  return (
    <Card key={index} className="flex flex-col">
      {isLoadingMarketData ? (
        <MarketCardSkeleton />
      ) : (
        <>
          <CardHeader className="flex justify-between items-start">
            <div>
              {market && <MarketTime endTime={market.endTime} />}
              <CardTitle>{market?.question}</CardTitle>
            </div>
            <span className="text-xs text-gray-500">ID:{index}</span>
          </CardHeader>

          <CardContent>
            {market && (
              <>
                {/* Show market progress */}
                <MarketProgress
                  options={market.options}
                  totalShares={market.totalShares}
                />
                
                {/* Conditionally show "Buy" or "Pending"/"Resolved" states */}
                {isExpired ? (
                  market.resolved ? (
                    <MarketResolved
                      marketId={index}
                      outcome={market.outcome}
                      options={market.options}
                    />
                  ) : (
                    <MarketPending />
                  )
                ) : (
                  <MarketBuyInterface
                    marketId={index}
                    market={{
                      question: market.question,
                      options: market.options,
                    }}
                  />
                )}
              </>
            )}
          </CardContent>

          <CardFooter>
            {market && sharesBalance && (
              <MarketSharesDisplay
                market={market}
                sharesBalance={sharesBalance.shares}
              />
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}