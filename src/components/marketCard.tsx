import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contracts";
import { MarketProgress } from "./marketProgress";
import { MarketTime } from "@/components/marketTime";
import { MarketCardSkeleton } from "./skeletonCard";
import { MarketSharesDisplay } from "./marketSharesDisplay";
import { MarketBuyInterface } from "./marketBuyInterface";
import { MarketResolved } from "./marketResolved";
import { MarketPending } from "./marketPending";

interface MarketCardProps {
  index: number;
  filter: 'active' | 'pending' | 'resolved';
}

interface Market {
  question: string;
  options: string[]; // Updated to dynamically handle 2 or 3 options
  endTime: bigint;
  outcome: number;
  totalShares: readonly bigint[];
  resolved: boolean;
}

interface SharesBalance {
    shares: readonly bigint[]; // Match the readonly type from the contract
}

export function MarketCard({ index, filter }: MarketCardProps) {
  const account = useActiveAccount();

  // Fetch market data
  const { data: marketData, isLoading: isLoadingMarketData } = useReadContract({
    contract,
    method: "function getMarketInfo(uint256) view returns (string, string[3], uint256, uint8, uint256[3], bool)",
    params: [BigInt(index)],
  });

  console.log(`Market Data for index ${index}:`, marketData);

  const market: Market | undefined = marketData
    ? {
        question: marketData[0],
        options: marketData[1].filter((option: string) => option.length > 0), // Filter empty options
        endTime: marketData[2],
        outcome: marketData[3],
        totalShares: marketData[4],
        resolved: marketData[5],
      }
    : undefined;

  console.log(`Processed Market for index ${index}:`, market);

  // Fetch user's share balance
  const { data: sharesBalanceData } = useReadContract({
    contract,
    method: "function getSharesBalance(uint256, address) view returns (uint256[3])",
    params: [BigInt(index), account?.address as string],
  });

  console.log(`Shares Balance Data for index ${index}:`, sharesBalanceData);

  const sharesBalance: SharesBalance | undefined = sharesBalanceData
    ? {
        shares: sharesBalanceData,
      }
    : undefined;

  const isExpired = new Date(Number(market?.endTime) * 1000) < new Date();
  const isResolved = market?.resolved;

  // Conditional display logic
  const shouldShow = () => {
    if (!market) return false;

    switch (filter) {
      case 'active':
        return !isExpired;
      case 'pending':
        return isExpired && !isResolved;
      case 'resolved':
        return isExpired && isResolved;
      default:
        return true;
    }
  };

  if (!shouldShow()) {
    return null;
  }

  return (
    <Card key={index} className="flex flex-col">
      {isLoadingMarketData ? (
        <MarketCardSkeleton />
      ) : (
        <>
          <CardHeader>
            {market && <MarketTime endTime={market.endTime} />}
            <CardTitle>{market?.question}</CardTitle>
          </CardHeader>
          <CardContent>
            {market && (
              <>
                <MarketProgress
                  options={market.options}
                  totalShares={market.totalShares}
                />
                {new Date(Number(market.endTime) * 1000) < new Date() ? (
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