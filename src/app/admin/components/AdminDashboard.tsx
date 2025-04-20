"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import marketVestaABI from '../../vesta/constants/marketVestaABI';

interface AdminDashboardProps {
  address: string;
}

interface Market {
  id: number;
  creator: string;
  resolver: string;
  question: string;
  outcomes: string[];
  endTime: bigint;
  state: number;
}

const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5";

const AdminDashboard: React.FC<AdminDashboardProps> = ({ address }) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, provider);
        
        // Get total markets count
        const totalMarkets = await contract.getMarketCount();
        
        // Fetch data for each market
        const marketData = [];
        for (let i = 0; i < totalMarkets; i++) {
          const marketId = i;
          const market = await contract.markets(marketId);
          marketData.push({
            id: marketId,
            creator: market.creator,
            resolver: market.resolver,
            question: market.question,
            outcomes: market.outcomes,
            endTime: market.endTime,
            state: market.state
          });
        }
        
        setMarkets(marketData);
      } catch (err) {
        console.error("Error loading market data:", err);
        setError("Failed to load market data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    loadMarketData();
  }, []);
  
  // Format state as readable string
  const formatState = (state: number) => {
    const states = ["Open", "Closed", "Resolved"];
    return states[state] || "Unknown";
  };
  
  // Format timestamp as readable date
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };
  
  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Market Administration
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Connected as: {address.substring(0, 6)}...{address.substring(address.length - 4)}
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading markets...</p>
        </div>
      ) : error ? (
        <div className="px-4 py-5 sm:p-6">
          <div className="text-red-600">{error}</div>
        </div>
      ) : markets.length === 0 ? (
        <div className="px-4 py-5 sm:p-6 text-center">
          <p className="text-gray-600">No markets found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {markets.map((market) => (
                <tr key={market.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{market.id.toString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{market.question}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {market.creator.substring(0, 6)}...{market.creator.substring(market.creator.length - 4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(market.endTime)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatState(market.state)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="#" className="text-indigo-600 hover:text-indigo-900">
                      Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 