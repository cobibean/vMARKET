import { Progress } from "@/app/ui/progress";
import React from "react";

interface MarketProgressProps {
  options: string[];
  totalShares: readonly bigint[];
}

// 1) Updated helper for 18 decimals (VESTA)
function toVesta(value: bigint) {
  return Number(value) / 1_000_000_000_000_000_000; // 1e18
}

export function MarketProgress({ 
  options, 
  totalShares
}: MarketProgressProps) {
  // total in raw bigints
  const total = totalShares.reduce((sum, shares) => sum + Number(shares), 0);

  return (
    <div className="mb-4">
      {options.map((option, index) => {
        const optionShares = totalShares[index] || BigInt(0);

        // Calculate % based on raw shares
        const optionValue = Number(optionShares);
        const percentage = total > 0
          ? (optionValue * 100) / total
          : 100 / options.length;

        return (
          <div key={index} className="mb-2">
            <div className="flex justify-between">
              <span>
                <span className="font-bold text-sm">
                  {option}: {toVesta(optionShares).toFixed(2)}{" "}
                  {/* Display VESTA with 2 decimals */}
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