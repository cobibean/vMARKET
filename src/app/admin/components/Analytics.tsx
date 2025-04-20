"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import marketVestaABI from '../../vesta/constants/marketVestaABI';

interface MarketStats {
  totalMarkets: number;
  activeMarkets: number;
  resolvedMarkets: number;
  totalShares: number;
  recentMarkets: {
    id: number;
    question: string;
    resolved: boolean;
    totalShares: number;
  }[];
}

interface LeagueDistribution {
  label: string;
  count: number;
  percentage: number;
}

// Contract address - should be in an environment variable in production
const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [leagueDistribution, setLeagueDistribution] = useState<LeagueDistribution[]>([]);
  const [view, setView] = useState<'overview' | 'markets' | 'share'>('overview');

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Call API to get analytics data
        const response = await fetch('/api/admin/analytics');
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const data = await response.json();
        setStats(data.stats);
        setLeagueDistribution(data.leagueDistribution);
      } catch (err: Error | unknown) {
        console.error('Error fetching analytics:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error fetching analytics data. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  // For demo purposes, we'll use mock data for now
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Mock data for development
      setTimeout(() => {
        setStats({
          totalMarkets: 48,
          activeMarkets: 15,
          resolvedMarkets: 33,
          totalShares: 1258,
          recentMarkets: [
            { id: 47, question: 'Barcelona @ Real Madrid (2025-06-12)', resolved: false, totalShares: 120 },
            { id: 46, question: 'Lakers @ Bulls (2025-06-10)', resolved: false, totalShares: 85 },
            { id: 45, question: 'Chiefs @ Ravens (2025-06-08)', resolved: true, totalShares: 210 },
            { id: 44, question: 'Arsenal @ Manchester United (2025-06-05)', resolved: true, totalShares: 175 },
            { id: 43, question: 'Clippers @ Celtics (2025-06-03)', resolved: true, totalShares: 95 }
          ]
        });
        
        setLeagueDistribution([
          { label: 'Champions League', count: 18, percentage: 37.5 },
          { label: 'NBA', count: 12, percentage: 25 },
          { label: 'NFL', count: 10, percentage: 20.8 },
          { label: 'Premier League', count: 8, percentage: 16.7 }
        ]);
        
        setLoading(false);
      }, 1000);
    }
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-3 text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
        <svg className="h-12 w-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-medium text-red-800 mb-2">Failed to Load Analytics</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Analytics Dashboard</h3>
      
      {/* Analytics Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setView('overview')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm 
              ${view === 'overview' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Overview
          </button>
          <button
            onClick={() => setView('markets')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${view === 'markets' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Markets
          </button>
          <button
            onClick={() => setView('share')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${view === 'share' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Social Share
          </button>
        </nav>
      </div>
      
      {/* Overview View */}
      {view === 'overview' && (
        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Total Markets</h4>
              <p className="text-3xl font-bold text-gray-800">{stats.totalMarkets}</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Active Markets</h4>
              <p className="text-3xl font-bold text-blue-600">{stats.activeMarkets}</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Resolved Markets</h4>
              <p className="text-3xl font-bold text-green-600">{stats.resolvedMarkets}</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Total Shares</h4>
              <p className="text-3xl font-bold text-purple-600">{stats.totalShares}</p>
            </div>
          </div>
          
          {/* League Distribution */}
          <div className="bg-white p-6 rounded-md border border-gray-200 mb-8">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Market Distribution by League</h4>
            <div className="space-y-4">
              {leagueDistribution.map((league) => (
                <div key={league.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{league.label}</span>
                    <span className="text-sm text-gray-500">{league.count} markets ({league.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${league.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Markets */}
          <div className="bg-white rounded-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-medium text-gray-800">Recent Markets</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Market
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shares
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recentMarkets.map((market) => (
                    <tr key={market.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {market.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {market.question}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          market.resolved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {market.resolved ? 'Resolved' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {market.totalShares}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Markets View (Placeholder) */}
      {view === 'markets' && (
        <div className="bg-white p-6 rounded-md border border-gray-200 text-center">
          <h4 className="text-lg font-medium text-gray-800 mb-2">Detailed Market Analytics</h4>
          <p className="text-gray-600 mb-4">
            This section will provide detailed analytics for individual markets, including:
          </p>
          <ul className="text-left max-w-md mx-auto text-sm text-gray-600 space-y-2 mb-4">
            <li>• Market participation rates</li>
            <li>• Share distribution across options</li>
            <li>• Historical performance</li>
            <li>• User engagement metrics</li>
          </ul>
          <p className="text-gray-500 text-sm italic">Coming in a future update</p>
        </div>
      )}
      
      {/* Social Share View (Placeholder) */}
      {view === 'share' && (
        <div className="bg-white p-6 rounded-md border border-gray-200">
          <h4 className="text-lg font-medium text-gray-800 mb-4">Social Share Cards</h4>
          <p className="text-gray-600 mb-6">
            Create shareable cards for your markets to post on social media.
          </p>
          
          {/* Demo Card */}
          <div className="max-w-md mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden shadow-lg mb-6">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Barcelona @ Real Madrid</h3>
                  <p className="text-blue-100 text-sm">Champions League • June 12, 2025</p>
                </div>
                <div className="bg-white rounded-full p-2">
                  <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0 2a10 10 0 100-20 10 10 0 000 20z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H7a1 1 0 010-2h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="bg-white bg-opacity-20 rounded-md p-3">
                  <span className="text-white font-medium">Barcelona</span>
                </div>
                <div className="bg-white bg-opacity-20 rounded-md p-3">
                  <span className="text-white font-medium">Real Madrid</span>
                </div>
                <div className="bg-white bg-opacity-20 rounded-md p-3">
                  <span className="text-white font-medium">Draw</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 p-4 text-center">
              <p className="text-white text-sm font-medium">Predict now at vMarket.io</p>
            </div>
          </div>
          
          <p className="text-center text-gray-500 text-sm italic">
            Social share feature coming in a future update. You&apos;ll be able to customize and 
            generate cards for any market.
          </p>
        </div>
      )}
    </div>
  );
} 