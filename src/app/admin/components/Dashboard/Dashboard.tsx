import React, { useState, useEffect } from 'react';
import { 
  getAllMarkets, 
  resolveMarket, 
  addAdmin, 
  removeAdmin, 
  addResolver, 
  removeResolver,
  createMarket
} from '../../../vesta/utils/contract';
import { MarketList } from '../Markets';
import { RoleManagement } from '../Roles';
import { Market } from './types';

interface DashboardProps {
  address: string;
}

export default function Dashboard({ address }: DashboardProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('markets'); // 'markets', 'roles', 'games'

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const marketData = await getAllMarkets();
      setMarkets(marketData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch markets. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMarket = async (question: string, outcomes: string[], endTime: number) => {
    try {
      setError(null);
      await createMarket(question, outcomes, endTime);
      await fetchMarkets();
      return true;
    } catch (err) {
      setError('Failed to create market. Please try again.');
      console.error(err);
      return false;
    }
  };

  const handleResolveMarket = async (marketId: number, outcome: number) => {
    try {
      setError(null);
      await resolveMarket(marketId, outcome);
      await fetchMarkets();
    } catch (err) {
      setError('Failed to resolve market. Please try again.');
      console.error(err);
    }
  };

  const handleAddAdmin = async (address: string) => {
    try {
      setError(null);
      await addAdmin(address);
    } catch (err) {
      setError('Failed to add admin. Please try again.');
      console.error(err);
    }
  };

  const handleRemoveAdmin = async (address: string) => {
    try {
      setError(null);
      await removeAdmin(address);
    } catch (err) {
      setError('Failed to remove admin. Please try again.');
      console.error(err);
    }
  };

  const handleAddResolver = async (address: string) => {
    try {
      setError(null);
      await addResolver(address);
    } catch (err) {
      setError('Failed to add resolver. Please try again.');
      console.error(err);
    }
  };

  const handleRemoveResolver = async (address: string) => {
    try {
      setError(null);
      await removeResolver(address);
    } catch (err) {
      setError('Failed to remove resolver. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('markets')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'markets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Markets
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Role Management
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'games'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Games Management
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'markets' && (
        <MarketList
          markets={markets}
          onRefreshMarkets={fetchMarkets}
          onCreateMarket={handleCreateMarket}
          onResolveMarket={handleResolveMarket}
          isLoading={loading}
          error={error}
        />
      )}

      {activeTab === 'roles' && (
        <RoleManagement
          onAddAdmin={handleAddAdmin}
          onRemoveAdmin={handleRemoveAdmin}
          onAddResolver={handleAddResolver}
          onRemoveResolver={handleRemoveResolver}
          error={error}
        />
      )}

      {activeTab === 'games' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Games Management</h2>
          <p>Games management functionality coming soon...</p>
        </div>
      )}
    </div>
  );
} 