import { Badge } from "./ui/badge";
import { toEther } from "thirdweb";
import { useEffect, useState } from "react";
import { toFixed } from "@/lib/utils";

interface MarketSharesDisplayProps {
    market: {
        question: string;
        options: string[];
        totalShares: readonly bigint[];
    };
    sharesBalance: readonly bigint[];
}

export function MarketSharesDisplay({
    market,
    sharesBalance,
}: MarketSharesDisplayProps) {
    const [winnings, setWinnings] = useState<bigint[]>(() =>
        Array(market.options.length).fill(BigInt(0))
    );

    const calculateWinnings = (optionIndex: number) => {
        if (!sharesBalance || !market) return BigInt(0);

        const userShares = sharesBalance[optionIndex] || BigInt(0);
        const totalSharesForOption = market.totalShares[optionIndex] || BigInt(0);
        const totalLosingShares = market.totalShares.reduce(
            (sum, shares, index) =>
                index !== optionIndex ? sum + shares : sum,
            BigInt(0)
        );

        if (totalSharesForOption === BigInt(0)) return BigInt(0);

        // Calculate user's proportion of the winning side
        const userProportion = (userShares * BigInt(1000000)) / totalSharesForOption; // Multiply by 1M for precision

        // Calculate their share of the losing side's shares
        const winningsFromLosingShares = (totalLosingShares * userProportion) / BigInt(1000000);

        // Total winnings is their original shares plus their proportion of losing shares
        return userShares + winningsFromLosingShares;
    };

    useEffect(() => {
        if (!sharesBalance || !market) return;

        const newWinnings = market.options.map((_, index) =>
            calculateWinnings(index)
        );

        setWinnings(newWinnings);
    }, [sharesBalance, market.totalShares]);

    return (
        <div className="flex flex-col gap-2">
            <div className="w-full text-sm text-muted-foreground">
                Your shares: {market.options.map((option, index) => (
                    <span key={index} className="block">
                        {option} - {Math.floor(parseInt(toEther(sharesBalance[index] || BigInt(0))))}
                    </span>
                ))}
            </div>
            {winnings.some((win) => win > 0) && (
                <div className="flex flex-col gap-1">
                    <div className="text-xs text-muted-foreground">Winnings:</div>
                    <div className="flex gap-2">
                        {market.options.map((option, index) => (
                            <Badge key={index} variant="secondary">
                                {option}: {toFixed(Number(toEther(winnings[index] || BigInt(0))), 2)} shares
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
