import { Progress } from "@/app/ui/progress";
import React from "react";

interface MarketProgressProps {
  options: string[];
  totalShares: readonly bigint[];
}

// 1) A simple helper to convert raw USDC shares (6 decimals) to a normal number
function toUsdc(value: bigint) {
  return Number(value) / 1_000_000; 
}

export function MarketProgress({ 
  options, 
  totalShares
}: MarketProgressProps) {
  // total in raw (no decimals)
  const total = totalShares.reduce((sum, shares) => sum + Number(shares), 0);

  return (
    <div className="mb-4">
      {options.map((option, index) => {
        const optionShares = BigInt(totalShares[index] || 0);

        // Calculate % based on raw shares
        const percentage =
          total > 0
            ? Number((optionShares * BigInt(100)) / BigInt(total))
            : 100 / options.length;

        return (
          <div key={index} className="mb-2">
            <div className="flex justify-between">
              <span>
                <span className="font-bold text-sm">
                  {option}:{" "}
                  {toUsdc(optionShares).toFixed(2) /* Display USDC with 2 decimals */}
                </span>
                {total > 0 && (
                  <span className="text-xs text-gray-500 ml-2">
                    {percentage.toFixed(2)}% {/* Display percentage with 2 decimals */}
                  </span>
                )}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        );
      })}
    </div>
  );
}