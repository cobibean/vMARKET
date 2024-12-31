import { Progress } from "@/components/ui/progress";
import { toEther } from "thirdweb";

interface MarketProgressProps {
    options: string[];
    totalShares: readonly bigint[];
}

export function MarketProgress({ 
    options, 
    totalShares
}: MarketProgressProps) {
    const total = totalShares.reduce((sum, shares) => sum + Number(shares), 0);

    return (
        <div className="mb-4">
            {options.map((option, index) => {
                const optionShares = BigInt(totalShares[index] || 0);
                const percentage = total > 0
                    ? Number((optionShares * BigInt(100)) / BigInt(total))
                        : 100 / options.length;

                return (
                    <div key={index} className="mb-2">
                        <div className="flex justify-between">
                            <span>
                                <span className="font-bold text-sm">
                                    {option}: {Math.floor(parseInt(toEther(optionShares)))}
                                </span>
                                {total > 0 && (
                                    <span className="text-xs text-gray-500"> {Math.floor(percentage)}%</span>
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
