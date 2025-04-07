"use client";

import { useState, useEffect } from "react";
import { Navbar } from "./navbar";
import { useReadContract } from "thirdweb/react";
import { contract } from "@/app/vesta/constants/contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/tabs";
import { MarketCardSkeleton } from "./skeletonCard";
import { MarketCard } from "./marketCard";
import { Footer } from "@/app/sharedComponents/footer";

interface PredictionMarketDashboardProps {
    room: string;
  }
  

const excludedMarketIds = [9, 10, 11, 12, 14, 57, 58, 75, 80, 81, 82, 86, 87, 88, 89, 90]; // Replace with actual market IDs to exclude

export default function PredictionMarketDashboard({ room }: PredictionMarketDashboardProps) {
    const { data: marketCount, isLoading: isLoadingMarketCount } = useReadContract({
      contract: contract,
      method: "function marketCount() view returns (uint256)",
      params: [],
    });
  

    // State for rulesMap
    const [rulesMap, setRulesMap] = useState<Record<string, string>>({});

    // Fetch rules.json from the public folder
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

    console.log("Market Count:", marketCount); // Debug market count
    console.log("Rules Map:", rulesMap); // Debug rulesMap

    if (isLoadingMarketCount || marketCount === undefined) {
        console.log("Market count is loading or undefined."); // Debug loading state
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading markets...</p>
            </div>
        );
    }

    // Generate skeleton cards while data loads
    const skeletonCards = Array.from({ length: 6 }, (_, index) => (
        <MarketCardSkeleton key={index} />
    ));

    // Generate market indexes, excluding the ones in excludedMarketIds
    const getFilteredMarketIndexes = () => {
        const indexes = Array.from(
            { length: Number(marketCount) },
            (_, index) => Number(BigInt(marketCount) - BigInt(1) - BigInt(index))
        ).filter((index) => !excludedMarketIds.includes(index));

        console.log("Filtered Market Indexes:", indexes); // Debug filtered indexes
        return indexes;
    };

    const filteredIndexes = getFilteredMarketIndexes();

    console.log("Filtered Indexes to Render:", filteredIndexes); // Debug filtered indexes

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
                                            room={room} // Pass room to MarketCard
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
                                            room={room} // Pass room to MarketCard
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
                                            room={room} // Pass room to MarketCard
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