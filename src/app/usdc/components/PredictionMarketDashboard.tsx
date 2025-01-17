"use client";

import { Navbar } from "./navbar"; 
import { useReadContract } from "thirdweb/react";
import { contract } from "@/app/usdc/constants/contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/tabs";
import { MarketCardSkeleton } from "./skeletonCard";
import { MarketCard } from "./marketCard";
import { Footer } from "@/app/sharedComponents/footer";

// List of excluded market IDs
const excludedMarketIds = [666]; // Replace with actual market IDs to exclude

export default function PredictionMarketDashboard() {
    const { data: marketCount, isLoading: isLoadingMarketCount } = useReadContract({
        contract: contract,
        method: "function marketCount() view returns (uint256)",
        params: []
    });

    console.log("Market Count:", marketCount);

    if (isLoadingMarketCount || marketCount === undefined) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading markets...</p>
            </div>
        );
    }

    const skeletonCards = Array.from({ length: 6 }, (_, index) => (
        <MarketCardSkeleton key={index} />
    ));

    // Filter out excluded market IDs
    const getFilteredMarketIndexes = () => {
        return Array.from({ length: Number(marketCount) }, (_, index) => 
            Number(BigInt(marketCount) - BigInt(1) - BigInt(index))
        ).filter(index => !excludedMarketIds.includes(index));
    };

    const filteredIndexes = getFilteredMarketIndexes();

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow container mx-auto p-4">
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
                                {filteredIndexes.map(index => (
                                    <MarketCard
                                        key={index}
                                        index={index}
                                        filter="active"
                                    />
                                ))}
                            </div>
                        </TabsContent>
                            
                        <TabsContent value="pending">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredIndexes.map(index => (
                                    <MarketCard
                                        key={index}
                                        index={index}
                                        filter="pending"
                                    />
                                ))}
                            </div>
                        </TabsContent>
                            
                        <TabsContent value="resolved">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredIndexes.map(index => (
                                    <MarketCard 
                                        key={index} 
                                        index={index}
                                        filter="resolved"
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