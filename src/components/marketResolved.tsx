import { Button } from "./ui/button";
import { prepareContractCall } from "thirdweb";
import { useSendAndConfirmTransaction } from "thirdweb/react";
import { contract } from "@/constants/contracts";
import { toast } from "./ui/useToast";

interface MarketResolvedProps {
    marketId: number;
    outcome: number;
    options: string[]; // Add this line
  }

export function MarketResolved({ 
    marketId,
    outcome, 
    options,
}: MarketResolvedProps) {
    const { mutateAsync: mutateTransaction } = useSendAndConfirmTransaction();

    const handleClaimRewards = async () => {
        console.log("Claim Rewards clicked for Market ID:", marketId);
        try {
            const tx = await prepareContractCall({
                contract,
                method: "function claimWinnings(uint256 _marketId)",
                params: [BigInt(marketId)]
            });

            await mutateTransaction(tx);

            toast({
                title: "Rewards Claimed",
                description: `Your winnings for market ID ${marketId} have been successfully claimed.`,
            });

        } catch (error) {
            console.error("Error caught in catch block:", error); // Log the entire error object
            if (error instanceof Error) {
                console.log("Error message from catch block:", error.message); // Log the error message specifically
            }

            console.error(error);

            if (error instanceof Error) {
            toast({
                title: "Transaction Error",
                description: error.message || "No winnings to claim.",
                variant: "destructive",
                });
            }
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="mb-2 bg-green-200 p-2 rounded-md text-center text-xs">
                {outcome >= 0 && outcome < options.length 
                    ? `Resolved: ${options[outcome]}` 
                    : "Error: Invalid Outcome"}
            </div>
            <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleClaimRewards}
            >
                Claim Rewards
            </Button>
        </div>
    );
}