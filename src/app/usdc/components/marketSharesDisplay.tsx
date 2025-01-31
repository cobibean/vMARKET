import { Badge } from "@/app/ui/badge";
import { useEffect, useState, useMemo } from "react";
import { toFixed } from "@/app/lib/utils";

interface MarketSharesDisplayProps {
  market: {
    question: string;
    options: string[];
    totalShares: readonly bigint[]; // Total shares for each option
  };
  sharesBalance: readonly bigint[]; // User's shares for each option
}

// 1) Create a helper that divides by 1e6 for USDC
function toUsdc(value: bigint) {
  return Number(value) / 1e6;
}

export function MarketSharesDisplay({
  market,
  sharesBalance,
}: MarketSharesDisplayProps) {
  const [winnings, setWinnings] = useState<bigint[]>([]);

  const calculateWinnings = (optionIndex: number): bigint => {
    if (!sharesBalance || !market) return BigInt(0);

    const userShares = BigInt(sharesBalance[optionIndex] || 0);
    const totalSharesForOption = BigInt(market.totalShares[optionIndex] || 0);
    const totalLosingShares = market.totalShares.reduce(
      (sum, shares, index) => (index !== optionIndex ? sum + BigInt(shares) : sum),
      BigInt(0)
    );

    if (totalSharesForOption === BigInt(0)) return BigInt(0);

    // Calculate user's proportion of the winning side
    const userProportion =
      (userShares * BigInt(1_000_000)) / totalSharesForOption; // Multiply by 1M for precision

    // Calculate their share of the losing side's shares
    const winningsFromLosingShares =
      (totalLosingShares * userProportion) / BigInt(1_000_000);

    // Total winnings = their original shares + proportion of losing side
    return userShares + winningsFromLosingShares;
  };

  useEffect(() => {
    if (!sharesBalance || !market) return;

    const newWinnings = market.options.map((_, index) => calculateWinnings(index));

    // Only update if values actually changed
    if (newWinnings.some((winning, index) => winning !== winnings[index])) {
      setWinnings(newWinnings);
    }
  }, [sharesBalance, market.totalShares]);

  const hasShares = useMemo(() => 
    sharesBalance.some(share => share > BigInt(0)),
    [sharesBalance]
  );

  return (
    <div className="flex flex-col gap-2">
      {hasShares && (
        <div className="w-full text-sm text-muted-foreground">
          Your shares:
          {market.options.map((option, index) => {
            const rawBalance = sharesBalance[index] || BigInt(0);
            const userFriendly = toUsdc(rawBalance);
            return rawBalance > BigInt(0) ? (
              <span key={index} className="block">
                {option}: {toFixed(userFriendly, 2)}
              </span>
            ) : null;
          }).filter(Boolean)}
        </div>
      )}

      {winnings.some((win) => win > 0) && (
        <div className="flex flex-col gap-1">
          <div className="text-xs text-muted-foreground">Winnings:</div>
          <div className="flex gap-2">
            {market.options.map((option, index) => {
              // 3) Convert winnings from raw to decimal
              const rawWin = winnings[index] || BigInt(0);
              const userFriendly = toUsdc(rawWin);

              return (
                <Badge key={index} variant="secondary">
                  {option}: {toFixed(userFriendly, 2)} shares
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}