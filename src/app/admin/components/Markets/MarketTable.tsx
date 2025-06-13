import React from 'react';
import { Market, MarketState } from '../Dashboard/types';
import { ActionButton } from '../shared';

interface MarketTableProps {
  markets: Market[];
  onResolveClick: (marketId: number) => void;
}

export default function MarketTable({ markets, onResolveClick }: MarketTableProps) {
  const formatTime = (timestamp: number | bigint) => {
    // Ensure timestamp is a number before multiplying
    const timestampNumber = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    return new Date(timestampNumber * 1000).toLocaleString();
  };

  const getMarketStateLabel = (state: number) => {
    switch (state) {
      case MarketState.OPEN:
        return 'Open';
      case MarketState.RESOLVED:
        return 'Resolved';
      case MarketState.CANCELED:
        return 'Canceled';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Question</th>
            <th className="py-2 px-4 border-b">Outcomes</th>
            <th className="py-2 px-4 border-b">End Time</th>
            <th className="py-2 px-4 border-b">State</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((market) => (
            <tr key={market.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{market.id}</td>
              <td className="py-2 px-4 border-b">{market.question}</td>
              <td className="py-2 px-4 border-b">
                <ul className="list-disc pl-5">
                  {market.outcomes && market.outcomes.length > 0 ? (
                    market.outcomes.map((outcome, index) => (
                      <li key={index}>{outcome}</li>
                    ))
                  ) : (
                    <li>No outcomes available</li>
                  )}
                </ul>
              </td>
              <td className="py-2 px-4 border-b">{formatTime(market.endTime)}</td>
              <td className="py-2 px-4 border-b">{getMarketStateLabel(market.state)}</td>
              <td className="py-2 px-4 border-b">
                {market.state === MarketState.OPEN && (
                  <ActionButton
                    onClick={() => onResolveClick(market.id)}
                    variant="success"
                  >
                    Resolve
                  </ActionButton>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 