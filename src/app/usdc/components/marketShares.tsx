"use client";

import { Badge } from "../../ui/badge";
import { useEffect, useState } from "react";
import { toFixed } from "@/app/lib/utils";

interface MarketSharesDisplayProps {
    market: {
        question: string;
        options: string[];
        totalShares: readonly bigint[];
    };
    sharesBalance: readonly bigint[];
}

// 1) A helper to convert raw 6-decimal USDC shares to a human-readable number
function toUsdc(value: bigint): number {
    return Number(value) / 1_000_000; // divide by 1e6
}

export function MarketSharesDisplay({
    market,
    sharesBalance,
}: MarketSharesDisplayProps) {
    const [winnings, setWinnings] = useState<bigint[]>(
        () => Array(market.options.length).fill(BigInt(0))
    );

    const calculateWinnings = (optionIndex: number) => {
        if (!sharesBalance || !market) return BigInt(0);

        const userShares = sharesBalance[optionIndex] || BigInt(0);
        const totalSharesForOption = market.totalShares[optionIndex] || BigInt(0);
        const totalLosingShares = market.totalShares.reduce(
            (sum, shares, index) => (index !== optionIndex ? sum + shares : sum),
            BigInt(0)
        );

        if (totalSharesForOption === BigInt(0)) return BigInt(0);

        // userProportion in "parts per 1M" to handle 6 decimals
        const userProportion =
            (userShares * BigInt(1_000_000)) / totalSharesForOption;

        // winningsFromLosingShares
        const winningsFromLosingShares =
            (totalLosingShares * userProportion) / BigInt(1_000_000);

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
                Your shares:{" "}
                {market.options.map((option, index) => {
                    // 2) Convert raw 6-decimal shares to a readable number
                    const rawShares = sharesBalance[index] || BigInt(0);
                    const displayShares = toUsdc(rawShares);

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
                    <div className="flex gap-2">
                        {market.options.map((option, index) => {
                            // 3) Convert raw winnings to readable number
                            const rawWin = winnings[index] || BigInt(0);
                            const displayWin = toUsdc(rawWin);

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