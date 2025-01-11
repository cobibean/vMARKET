"use client";

import { Navbar } from "./navbar"; 
import { useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { MarketCardSkeleton } from "./skeletonCard";
import { MarketCard } from "./marketCard";
import { Footer } from "./footer";

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
    {Array.from({ length: Number(marketCount) }, (_, index) => (
        <MarketCard
            key={index}
            index={Number(BigInt(marketCount) - BigInt(1) - BigInt(index))}
            filter="active"
        />
    ))
    .sort((a, b) => {
        const now = new Date().getTime();
        const aEndTime = Number(a.props.endTime) * 1000; // Convert bigint to milliseconds
        const bEndTime = Number(b.props.endTime) * 1000;
        const aRemainingTime = aEndTime - now; // Time until `a` ends
        const bRemainingTime = bEndTime - now; // Time until `b` ends
        return aRemainingTime - bRemainingTime; // Shortest time remaining first
    })}
    </div>
</TabsContent>
                            
                            <TabsContent value="pending">
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.from({ length: Number(marketCount) }, (_, index) => (
                                    <MarketCard
                                        key={index}
                                        index={Number(BigInt(marketCount) - BigInt(1) - BigInt(index))} 
                                        filter="pending"
                                        />
                                    ))}
                                </div>
                            </TabsContent>
                            
                            <TabsContent value="resolved">
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Array.from({ length: Number(marketCount) }, (_, index) => ( 
                                        <MarketCard 
                                            key={index} 
                                            index={Number (BigInt(marketCount) - 1n - BigInt(index))}
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