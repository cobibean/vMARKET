"use client";

import { useState, useEffect } from "react";
import { Navbar } from "./navbar";
import { useReadContract } from "thirdweb/react";
import { contract } from "@/app/usdc/constants/contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/tabs";
import { MarketCardSkeleton } from "./skeletonCard";
import { MarketCard } from "./marketCard";
import { Footer } from "@/app/sharedComponents/footer";

interface PredictionMarketDashboardProps {
  room: string; // Define room prop type
}

const excludedMarketIds = [30, 31, 32, 33]; // Replace with actual market IDs to exclude

export default function PredictionMarketDashboard({ room }: PredictionMarketDashboardProps) {
  const { data: marketCount, isLoading: isLoadingMarketCount } = useReadContract({
    contract: contract,
    method: "function marketCount() view returns (uint256)",
    params: [],
  });

  const [rulesMap, setRulesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await fetch("/rules.json");
        if (!response.ok) throw new Error("Failed to fetch rules");
        const data = await response.json();

        const filteredRules = data.reduce(
          (acc: Record<string, string>, rule: { marketId: number; room: string; rule: string }) => {
            if (rule.room === room) {
              const key = `${rule.room}_${rule.marketId}`; // Create a unique key
              acc[key] = rule.rule;
            }
            return acc;
          },
          {}
        );

        setRulesMap(filteredRules);
      } catch (error) {
        console.error("Error fetching rules:", error);
      }
    };
    fetchRules();
  }, [room]);

  console.log("Rules Map:", rulesMap);

  if (isLoadingMarketCount || marketCount === undefined) {
    console.log("Market count is loading or undefined.");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading markets...</p>
      </div>
    );
  }

  const skeletonCards = Array.from({ length: 6 }, (_, index) => (
    <MarketCardSkeleton key={index} />
  ));

  const getFilteredMarketIndexes = () => {
    const indexes = Array.from(
      { length: Number(marketCount) },
      (_, index) => Number(BigInt(marketCount) - BigInt(1) - BigInt(index))
    ).filter((index) => !excludedMarketIds.includes(index));

    console.log("Filtered Market Indexes:", indexes);
    return indexes;
  };

  const filteredIndexes = getFilteredMarketIndexes();

  console.log("Filtered Indexes to Render:", filteredIndexes);

  return (
    <div className="max-h-screen flex flex-col">
      <div className="flex-grow w-full p-4">
        <Navbar />
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          {isLoadingMarketCount ? (
            <TabsContent value="active" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {skeletonCards}
              </div>
            </TabsContent>
          ) : (
            <>
              <TabsContent value="active">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredIndexes.map((index) => (
                    <MarketCard
                      key={index}
                      index={index}
                      filter="active"
                      rulesMap={rulesMap} // Pass rulesMap
                      room={room} // Pass room
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pending">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredIndexes.map((index) => (
                    <MarketCard
                      key={index}
                      index={index}
                      filter="pending"
                      rulesMap={rulesMap} // Pass rulesMap
                      room={room} // Pass room
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resolved">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredIndexes.map((index) => (
                    <MarketCard
                      key={index}
                      index={index}
                      filter="resolved"
                      rulesMap={rulesMap} // Pass rulesMap
                      room={room} // Pass room
                    />
                  ))}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}