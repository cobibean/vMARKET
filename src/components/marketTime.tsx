import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MarketTimeProps {
    endTime: bigint;
    className?: string;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const calculateTimeRemaining = (endTime: bigint) => {
    const now = new Date().getTime();
    const end = Number(endTime) * 1000;
    const diff = end - now;

    if (diff <= 0) {
        return "Ended";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
};

export function MarketTime({ endTime, className }: MarketTimeProps) {
    const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(endTime));
    const isEnded = timeRemaining === "Ended";
    const formattedDate = formatDate(new Date(Number(endTime) * 1000).toISOString());

    useEffect(() => {
        if (isEnded) return;

        const interval = setInterval(() => {
            const remaining = calculateTimeRemaining(endTime);
            setTimeRemaining(remaining);

            if (remaining === "Ended") {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime, isEnded]);

    return (
        <div
            className={cn(
                "mb-2 w-fit px-2 py-1 rounded border text-xs",
                isEnded 
                    ? "bg-red-200 border-red-300 text-red-800" 
                    : "border-gray-300 text-orange",
                className
            )}
        >
            {isEnded ? "Ended: " : "Ends: "}{formattedDate}
            {!isEnded && (
                <div className="mt-1 text-gray-600 text-xs">
                    Time Remaining: {timeRemaining}
                </div>
            )}
        </div>
    );
}