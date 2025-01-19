import { Button } from "@/app/ui/button";
import { prepareContractCall } from "thirdweb";
import { useSendAndConfirmTransaction } from "thirdweb/react";
import { contract } from "@/app/usdc/constants/contracts";
import { toast } from "@/app/ui/useToast";

interface MarketResolvedProps {
    marketId: number;
    outcome: number;
    options: string[];
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
            const tx = prepareContractCall({
                contract,
                method: "function claimWinnings(uint256 _marketId)",
                params: [BigInt(marketId)],
            });

            await mutateTransaction(tx);

            toast({
                title: "Rewards Claimed",
                description: `Your winnings for market ID ${marketId} have been successfully claimed.`,
            });
        } catch (error) {
            console.error("Error caught in catch block:", error);

            if (error instanceof Error) {
                console.log("Error message from catch block:", error.message);

                const errorMessage = error.message.toLowerCase();

                // Check for gas-related error messages
                if (
                    errorMessage.includes("out of gas") ||
                    errorMessage.includes("insufficient funds")
                ) {
                    toast({
                        title: "Transaction Error",
                        description:
                            "You don't have enough gas to complete this transaction. Please ensure your wallet has sufficient funds.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Transaction Error",
                        description:
                            error.message || "An error occurred while claiming your rewards.",
                        variant: "destructive",
                    });
                }
            } else {
                // Handle unknown errors
                toast({
                    title: "Unknown Error",
                    description: "An unexpected error occurred. Please try again.",
                    variant: "destructive",
                });
            }
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Theme-aware Resolved Container */}
            <div className="mb-2 bg-green-200 dark:bg-green-800 p-2 rounded-md text-center text-xs text-green-800 dark:text-green-200">
                {outcome >= 0 && outcome < options.length
                    ? `Resolved: ${options[outcome]}`
                    : "Error: Invalid Outcome"}
            </div>
            {/* Claim Rewards Button */}
            <Button variant="outline" className="w-full" onClick={handleClaimRewards}>
                Claim Rewards
            </Button>
        </div>
    );
}