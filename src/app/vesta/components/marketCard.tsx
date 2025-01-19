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
import { MarketInfoModal } from "@/app/sharedComponents/MarketInfoModal";
import { useState, useMemo } from "react";

interface MarketCardProps {
  index: number;
  filter: "active" | "pending" | "resolved";
  rulesMap: Record<number, string>; // Map of marketId to rules
  
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


export function MarketCard({ index, filter, rulesMap }: MarketCardProps) {
  const account = useActiveAccount();
  const [isInfoOpen, setIsInfoOpen] = useState(false); // State for modal visibility
  const marketRule = rulesMap[index] || "No rule available for this market.";
  console.log("MarketCard props:", { index, filter, rulesMap });
  console.log("Resolved rule for market:", rulesMap[index]);

  // --- 1. Fetch Market Data ---
  const { data: marketData, isLoading: isLoadingMarketData } = useReadContract({
    contract,
    method: "function getMarketInfo(uint256) view returns (string, string[], uint256, uint8, uint256[], bool)",
    params: [BigInt(index)],
  });

  const market = marketData
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
    method: "function getSharesBalance(uint256, address) view returns (uint256[3])",
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
        return !isExpired;
      case "pending":
        return isExpired && !isResolved;
      case "resolved":
        return isExpired && isResolved;
      default:
        return true;
    }
  }, [filter, isExpired, isResolved, market]);

  if (!shouldShow) {
    return null;
  }


  // --- 5. Render ---
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
                <MarketProgress
                  options={market.options}
                  totalShares={market.totalShares}
                />
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
            <button
              className="mt-2 text-sm text-primary underline hover:text-primary/80"
              onClick={() => setIsInfoOpen(true)}
            >
              View Market Info
            </button>
          </CardContent>

          <CardFooter>
            {market && sharesBalance && (
              <MarketSharesDisplay
                market={market}
                sharesBalance={sharesBalance.shares}
              />
            )}
          </CardFooter>

          <MarketInfoModal
            isOpen={isInfoOpen}
            onClose={() => setIsInfoOpen(false)}
            marketRules={marketRule} // Pass dynamic rule to modal
          />
        </>
      )}
    </Card>
  );
}