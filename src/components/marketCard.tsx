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
import { useEffect } from "react";


// Props for the MarketCard component
// index is the market id
// filter is the filter to apply to the market
interface MarketCardProps {
  index: number;
  filter: 'active' | 'pending' | 'resolved';
}

// Interface for the market data
interface Market {
  question: string;
  optionA: string;
  optionB: string;
  endTime: bigint;
  outcome: number;
  totalOptionAShares: bigint;
  totalOptionBShares: bigint;
  resolved: boolean;
}

// Interface for the shares balance
interface SharesBalance {
  optionAShares: bigint;
  optionBShares: bigint;
}

export function MarketCard({ index, filter }: MarketCardProps) {
    // Get the active account
    const account = useActiveAccount();

    // Get the market data
    const { data: marketData, isLoading: isLoadingMarketData } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved)",
        params: [BigInt(index)]
    });


    // Parse the market data
    const market: Market | undefined = marketData ? {
        question: marketData[0],
        optionA: marketData[1],
        optionB: marketData[2],
        endTime: marketData[3],
        outcome: marketData[4],
        totalOptionAShares: marketData[5],
        totalOptionBShares: marketData[6],
        resolved: marketData[7]
    } : undefined;

    // Get the shares balance
    const { data: sharesBalanceData } = useReadContract({
        contract,
        method: "function getSharesBalance(uint256 _marketId, address _user) view returns (uint256 optionAShares, uint256 optionBShares)",
        params: [BigInt(index), account?.address as string]
    });

    // Parse the shares balance
    const sharesBalance: SharesBalance | undefined = sharesBalanceData ? {
        optionAShares: sharesBalanceData[0],
        optionBShares: sharesBalanceData[1]
    } : undefined;

    // Check if the market is expired
    const isExpired = new Date(Number(market?.endTime) * 1000) < new Date();
    // Check if the market is resolved
    const isResolved = market?.resolved;

    // Log only when market data changes
    useEffect(() => {
        if (market) {
            console.group(`%c Market ID: ${index}`, "color: teal; font-weight: bold; font-size: 14px;");
            console.log(`%c Question: %c${market.question}`, "color: green; font-weight: bold;", "color: black;");
            console.log(`%c Options: %c${market.optionA}(1) or ${market.optionB}(2)`, "color: purple; font-weight: bold;", "color: black;");
            console.log(`%c Pending Resolution: %c${isExpired && !isResolved ? "Pending" : "Not Pending"}`, "color: orange; font-weight: bold;", "color: black;");
            console.log(`%c Resolved: %c${isResolved ? "Resolved" : "Not Resolved"}`, "color: blue; font-weight: bold;", "color: black;");
            console.log(`%c Outcome: %c${isResolved ? (market.outcome === 0 ? market.optionA : market.optionB) : "N/A"}`, "color: purple; font-weight: bold;", "color: black;");
            console.groupEnd();
                console.groupEnd();
            }
        }, [market, isExpired, isResolved, index]); // Dependencies ensure it logs only when data changes

    // Check if the market should be shown
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

    // If the market should not be shown, return null
    if (!shouldShow()) {
        return null;
    }

    console.log("Props passed to MarketResolved:", {
        marketId: index,
        outcome: market?.outcome,
        optionA: market?.optionA,
        optionB: market?.optionB,
    });

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
                            <MarketProgress 
                                optionA={market.optionA}
                                optionB={market.optionB}
                                totalOptionAShares={market.totalOptionAShares}
                                totalOptionBShares={market.totalOptionBShares}
                            />
                        )}
                        {new Date(Number(market?.endTime) * 1000) < new Date() ? (
                            market?.resolved ? (
                                <MarketResolved 
                                    marketId={index}
                                    outcome={market.outcome}
                                    optionA={market.optionA}
                                    optionB={market.optionB}
                                
                                />
                            ) : (
                                <MarketPending />
                            )
                        ) : (
                            <MarketBuyInterface 
                                marketId={index}
                                market={market!}
                            />
                        )}
                    </CardContent>
                    <CardFooter>
                        {market && sharesBalance && (
                            <MarketSharesDisplay 
                                market={market}
                                sharesBalance={sharesBalance}
                            />
                        )}
                    </CardFooter>
                </>
            )}
        </Card>
    )
}