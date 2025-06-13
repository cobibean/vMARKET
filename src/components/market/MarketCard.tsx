import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { formatPrice, truncateString } from '@/lib/utils';

export type MarketStatus = 'active' | 'pending' | 'resolved';
export type MarketOutcome = {
  id: string;
  name: string;
  price: number;
  probability: number;
};

export interface MarketCardProps {
  id: string;
  title: string;
  description?: string;
  outcomes: MarketOutcome[];
  status: MarketStatus;
  endTime?: Date;
  volume?: number;
  liquidity?: number;
  createdBy?: string;
  onCardClick?: (id: string) => void;
  className?: string;
}

export function MarketCard({
  id,
  title,
  description,
  outcomes,
  status,
  endTime,
  volume = 0,
  liquidity = 0,
  createdBy,
  onCardClick,
  className,
}: MarketCardProps) {
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(id);
    }
  };

  // Get the top 2 outcomes for display
  const topOutcomes = outcomes.slice(0, 2);
  
  // Format the remaining time if available
  const formattedTime = endTime ? new Date(endTime).toLocaleDateString() : '';
  
  // Determine status color
  const statusColors = {
    active: "text-primary",
    pending: "text-accent",
    resolved: "text-muted-foreground"
  };

  return (
    <Card 
      className={`cursor-pointer hover:border-primary transition-all duration-200 ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{truncateString(title, 60)}</CardTitle>
          <span className={`text-xs font-medium uppercase ${statusColors[status]}`}>
            {status}
          </span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {truncateString(description, 100)}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 mt-2">
          {topOutcomes.map((outcome) => (
            <div key={outcome.id} className="flex justify-between items-center">
              <span className="text-sm font-medium">{outcome.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono">
                  {formatPrice(outcome.price)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {Math.round(outcome.probability * 100)}%
                </span>
              </div>
            </div>
          ))}

          {outcomes.length > 2 && (
            <div className="text-xs text-muted-foreground text-center mt-1">
              + {outcomes.length - 2} more outcomes
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between border-t border-border mt-4">
        <div className="flex space-x-3 text-xs text-muted-foreground">
          <span>Vol: {formatPrice(volume)}</span>
          <span>Liq: {formatPrice(liquidity)}</span>
        </div>
        
        {formattedTime && (
          <div className="text-xs text-muted-foreground">
            {status === 'active' ? 'Ends' : status === 'pending' ? 'Starts' : 'Ended'}: {formattedTime}
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 