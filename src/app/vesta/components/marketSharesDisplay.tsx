import { Badge } from "@/app/ui/badge";
import { useEffect, useState } from "react";
import { toFixed } from "@/app/lib/utils";

interface MarketSharesDisplayProps {
  market: {
    question: string;
    options: string[];
    totalShares: readonly bigint[]; // Total shares for each option
  };
  sharesBalance: readonly bigint[]; // User's shares for each option
}

// 1) Convert raw 18-decimal VESTA shares to a human-readable number
function toVesta(value: bigint) {
  return Number(value) / 1_000_000_000_000_000_000; // 1e18
}

export function MarketSharesDisplay({
  market,
  sharesBalance,
}: MarketSharesDisplayProps) {
  const [winnings, setWinnings] = useState<bigint[]>([]);

  const calculateWinnings = (optionIndex: number): bigint => {
    if (!sharesBalance || !market) return BigInt(0);

    const userShares = sharesBalance[optionIndex] || BigInt(0);
    const totalSharesForOption = market.totalShares[optionIndex] || BigInt(0);
    const totalLosingShares = market.totalShares.reduce(
      (sum, shares, index) => (index !== optionIndex ? sum + shares : sum),
      BigInt(0)
    );

    if (totalSharesForOption === BigInt(0)) return BigInt(0);

    // userProportion in parts per 1e18
    const userProportion =
      (userShares * BigInt(1_000_000_000_000_000_000)) / totalSharesForOption;

    const winningsFromLosingShares =
      (totalLosingShares * userProportion) / BigInt(1_000_000_000_000_000_000);

    // Total winnings = original user shares + proportion of losing side
    return userShares + winningsFromLosingShares;
  };

  useEffect(() => {
    if (!sharesBalance || !market) return;

    const newWinnings = market.options.map((_, i) => calculateWinnings(i));

    // Only update if values changed
    if (newWinnings.some((winning, i) => winning !== winnings[i])) {
      setWinnings(newWinnings);
    }
  }, [sharesBalance, market.totalShares]);

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full text-sm text-muted-foreground">
        Your shares:
        {market.options.map((option, i) => {
          // Convert user shares (18 decimals) to a float
          const rawBalance = sharesBalance[i] || BigInt(0);
          const displayBalance = toVesta(rawBalance);

          return (
            <span key={i} className="block">
              {option}: {toFixed(displayBalance, 2)}
            </span>
          );
        })}
      </div>

      {winnings.some((win) => win > 0) && (
        <div className="flex flex-col gap-1">
          <div className="text-xs text-muted-foreground">Winnings:</div>
          <div className="flex gap-2 flex-wrap">
            {market.options.map((option, i) => {
              const rawWin = winnings[i] || BigInt(0);
              const displayWin = toVesta(rawWin);

              return (
                <Badge key={i} variant="secondary">
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