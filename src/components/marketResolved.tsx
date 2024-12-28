import { Button } from "./ui/button";
import { prepareContractCall } from "thirdweb";
import { useSendAndConfirmTransaction } from "thirdweb/react";
import { contract } from "@/constants/contracts";
import { toast } from "./ui/useToast";

interface MarketResolvedProps {
    marketId: number;
    outcome: number;
    optionA: string;
    optionB: string;
}

export function MarketResolved({ 
    marketId,
    outcome, 
    optionA, 
    optionB
}: MarketResolvedProps) {
    const { mutateAsync: mutateTransaction } = useSendAndConfirmTransaction();

    const handleClaimRewards = async () => {
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
                {outcome === 1 
                    ? `Resolved: ${optionA}` 
                    : outcome === 2 
                    ? `Resolved: ${optionB}` 
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