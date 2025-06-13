"use client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/ui/card";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { MarketProgress } from "@/app/usdc/components/marketProgress";
import { MarketTime } from "@/app/usdc/components/marketTime";
import { MarketSharesDisplay } from "@/app/usdc/components/marketSharesDisplay";
import { Button } from "@/app/ui/button";
import { cn } from "@/app/lib/utils";
import { contract as usdcContract } from "@/app/usdc/constants/contracts";
import { contract as vestaContract } from "@/app/vesta/constants/contracts";
import { type UserMarket } from "@/app/lib/api";

interface UserMarketCardProps {
  market: UserMarket;
  onClaimSuccess: (marketId: number) => void;
}

export function UserMarketCard({ market, onClaimSuccess }: UserMarketCardProps) {
  const account = useActiveAccount();
  const contract = market.room === 'usdc' ? usdcContract : vestaContract;

  const { data: marketData } = useReadContract({
    contract,
    method: "function getMarketInfo(uint256) view returns (string, string[], uint256, uint8, uint256[], bool)",
    params: [BigInt(market.market_id)],
  });

  const fullMarket = marketData ? {
    question: marketData[0],
    options: marketData[1].filter((o: string) => o.length > 0),
    endTime: marketData[2],
    outcome: marketData[3],
    totalShares: marketData[4],
    resolved: marketData[5],
  } : null;

  if (!fullMarket) return null;

  const sharesBalance = {
    shares: market.shares.map(s => BigInt(Math.floor(s)))
  };

  return (
    <Card className={cn(
      "flex flex-col transition-opacity",
      market.claimed ? "opacity-50 border-green-500" : "border-primary"
    )}>
      <CardHeader className="flex justify-between items-start">
        <div>
          <MarketTime endTime={fullMarket.endTime} />
          <CardTitle>{fullMarket.question}</CardTitle>
          <span className="text-xs text-muted-foreground">
            {market.room.toUpperCase()} Market #{market.market_id}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <MarketProgress
          options={fullMarket.options}
          totalShares={fullMarket.totalShares}
        />
        
        <div className="mt-4 space-y-2">
          <MarketSharesDisplay
            market={fullMarket}
            sharesBalance={sharesBalance.shares}
          />
          
          {!market.claimed && (
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => onClaimSuccess(market.market_id)}
                disabled={!account}
              >
                Claim Winnings
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {market.claimed && (
        <CardFooter className="text-sm text-green-500">
          Successfully claimed
        </CardFooter>
      )}
    </Card>
  );
} 