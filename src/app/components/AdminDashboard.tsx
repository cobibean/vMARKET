'use client';

import { useState, useEffect } from 'react';
import { 
  getAllMarkets, 
  resolveMarket, 
  addAdmin, 
  removeAdmin, 
  addResolver, 
  removeResolver,
  createMarket,
  MarketState
} from '../vesta/utils/contract';

interface Market {
  id: number;
  creator: string;
  resolver: string;
  question: string;
  outcomes: string[];
  endTime: number;
  state: number;
}

interface Game {
  game_id: string;
  local_date: string;
  start_time: string;
  league_id: string;
  home_team: {
    team_id: string;
    name: string;
    short_code: string;
    image_path: string;
  };
  away_team: {
    team_id: string;
    name: string;
    short_code: string;
    image_path: string;
  };
}

interface AdminDashboardProps {
  address: string;
}

export default function AdminDashboard({ address }: AdminDashboardProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  const [winningOutcome, setWinningOutcome] = useState<number>(0);
  const [roleAddress, setRoleAddress] = useState('');
  const [resolving, setResolving] = useState(false);
  const [roleAction, setRoleAction] = useState(false);
  const [showCreateMarketForm, setShowCreateMarketForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newMarket, setNewMarket] = useState({
    question: '',
    outcomes: ['Yes', 'No'],
    endTime: ''
  });
  
  // Games management state
  const [activeTab, setActiveTab] = useState('markets'); // 'markets', 'roles', 'games'
  const [fetchDate, setFetchDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLeague, setSelectedLeague] = useState('CL');
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [creatingBatchMarkets, setCreatingBatchMarkets] = useState(false);

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

  const handleResolveMarket = async () => {
    if (selectedMarketId === null) return;
    
    try {
      setResolving(true);
      await resolveMarket(selectedMarketId, winningOutcome);
      await fetchMarkets();
      setSelectedMarketId(null);
      setWinningOutcome(0);
    } catch (err) {
      setError('Failed to resolve market. Please try again.');
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  const handleRoleAction = async (action: string) => {
    if (!roleAddress) return;
    
    try {
      setRoleAction(true);
      
      switch (action) {
        case 'addAdmin':
          await addAdmin(roleAddress);
          break;
        case 'removeAdmin':
          await removeAdmin(roleAddress);
          break;
        case 'addResolver':
          await addResolver(roleAddress);
          break;
        case 'removeResolver':
          await removeResolver(roleAddress);
          break;
        default:
          break;
      }
      
      setRoleAddress('');
    } catch (err) {
      setError(`Failed to ${action}. Please try again.`);
      console.error(err);
    } finally {
      setRoleAction(false);
    }
  };

  const handleCreateMarket = async () => {
    try {
      setCreating(true);
      setError(null);
      
      // Validate inputs
      if (!newMarket.question.trim()) {
        setError('Question is required');
        setCreating(false);
        return;
      }
      
      if (newMarket.outcomes.length < 2) {
        setError('At least two outcomes are required');
        setCreating(false);
        return;
      }
      
      if (!newMarket.endTime) {
        setError('End time is required');
        setCreating(false);
        return;
      }
      
      // Convert end time to timestamp
      const endTimestamp = Math.floor(new Date(newMarket.endTime).getTime() / 1000);
      
      if (endTimestamp <= Math.floor(Date.now() / 1000)) {
        setError('End time must be in the future');
        setCreating(false);
        return;
      }
      
      // Create market
      await createMarket(
        newMarket.question,
        newMarket.outcomes,
        endTimestamp
      );
      
      // Reset form and close modal
      setNewMarket({
        question: '',
        outcomes: ['Yes', 'No'],
        endTime: ''
      });
      setShowCreateMarketForm(false);
      
      // Refresh markets
      await fetchMarkets();
    } catch (err) {
      setError('Failed to create market. Please try again.');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const addOutcome = () => {
    setNewMarket({
      ...newMarket,
      outcomes: [...newMarket.outcomes, '']
    });
  };

  const updateOutcome = (index: number, value: string) => {
    const updatedOutcomes = [...newMarket.outcomes];
    updatedOutcomes[index] = value;
    setNewMarket({
      ...newMarket,
      outcomes: updatedOutcomes
    });
  };

  const removeOutcome = (index: number) => {
    if (newMarket.outcomes.length <= 2) {
      setError('At least two outcomes are required');
      return;
    }
    
    const updatedOutcomes = [...newMarket.outcomes];
    updatedOutcomes.splice(index, 1);
    setNewMarket({
      ...newMarket,
      outcomes: updatedOutcomes
    });
    
    setError(null);
  };

  // Games Management Functions
  const fetchGames = async () => {
    try {
      setLoadingGames(true);
      setError(null);
      
      // In a real implementation, you would call your API to fetch games
      // For now, we'll simulate a fetch from your JSON files
      const response = await fetch(`/api/admin/games?date=${fetchDate}&league=${selectedLeague}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      
      const data = await response.json();
      setGames(data.games);
    } catch (err) {
      setError('Failed to fetch games. Please try again.');
      console.error(err);
    } finally {
      setLoadingGames(false);
    }
  };

  const handleGameSelection = (gameId: string) => {
    if (selectedGames.includes(gameId)) {
      setSelectedGames(selectedGames.filter(id => id !== gameId));
    } else {
      setSelectedGames([...selectedGames, gameId]);
    }
  };

  const createMarketsFromGames = async () => {
    try {
      setCreatingBatchMarkets(true);
      setError(null);
      
      if (selectedGames.length === 0) {
        setError('Please select at least one game');
        setCreatingBatchMarkets(false);
        return;
      }
      
      const selectedGameData = games.filter(game => selectedGames.includes(game.game_id));
      
      // Create markets for each selected game
      for (const game of selectedGameData) {
        const question = `${game.away_team.name} @ ${game.home_team.name} (${game.local_date})`;
        const options = [game.away_team.name, game.home_team.name, "Draw in regular time"];
        
        // Convert game time to timestamp and calculate duration
        const gameStart = new Date(game.start_time.replace(' ', 'T') + 'Z');
        const duration = Math.floor((gameStart.getTime() - Date.now()) / 1000);
        
        if (duration <= 0) {
          console.log(`Skipping market for ${question}: game already started.`);
          continue;
        }
        
        await createMarket(question, options, duration);
      }
      
      // Refresh markets
      await fetchMarkets();
      
      // Clear selection
      setSelectedGames([]);
    } catch (err) {
      setError('Failed to create markets from games. Please try again.');
      console.error(err);
    } finally {
      setCreatingBatchMarkets(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
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

  // UI Rendering Functions
  const renderTabs = () => (
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
  );

  const renderRoleManagement = () => (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Role Management</h2>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Wallet Address"
          value={roleAddress}
          onChange={(e) => setRoleAddress(e.target.value)}
          className="flex-grow px-4 py-2 border rounded"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleRoleAction('addAdmin')}
          disabled={roleAction}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Add Admin
        </button>
        <button 
          onClick={() => handleRoleAction('removeAdmin')}
          disabled={roleAction}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Remove Admin
        </button>
        <button 
          onClick={() => handleRoleAction('addResolver')}
          disabled={roleAction}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Add Resolver
        </button>
        <button 
          onClick={() => handleRoleAction('removeResolver')}
          disabled={roleAction}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Remove Resolver
        </button>
      </div>
    </div>
  );

  const renderMarketSection = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Markets</h2>
        <button
          onClick={() => setShowCreateMarketForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Market
        </button>
      </div>
      
      {loading ? (
        <p>Loading markets...</p>
      ) : markets.length === 0 ? (
        <p>No markets found.</p>
      ) : (
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
                      {market.outcomes.map((outcome, index) => (
                        <li key={index}>{outcome}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-2 px-4 border-b">{formatTime(market.endTime)}</td>
                  <td className="py-2 px-4 border-b">{getMarketStateLabel(market.state)}</td>
                  <td className="py-2 px-4 border-b">
                    {market.state === MarketState.OPEN && (
                      <button
                        onClick={() => setSelectedMarketId(market.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6">
        <button 
          onClick={fetchMarkets}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Refresh Markets
        </button>
      </div>
    </>
  );

  const renderGamesManagement = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Games Management</h2>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={fetchDate}
              onChange={(e) => setFetchDate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">League</label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="CL">Champions League</option>
              <option value="EPL">Premier League</option>
              <option value="NFL">NFL</option>
              <option value="NBA">NBA</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchGames}
              disabled={loadingGames}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loadingGames ? 'Loading...' : 'Fetch Games'}
            </button>
          </div>
        </div>
      </div>
      
      {loadingGames ? (
        <p>Loading games...</p>
      ) : games.length === 0 ? (
        <p>No games found. Try fetching games for a different date or league.</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b"></th>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Time</th>
                  <th className="py-2 px-4 border-b">Away Team</th>
                  <th className="py-2 px-4 border-b">Home Team</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr 
                    key={game.game_id} 
                    className={`hover:bg-gray-50 ${selectedGames.includes(game.game_id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="py-2 px-4 border-b">
                      <input
                        type="checkbox"
                        checked={selectedGames.includes(game.game_id)}
                        onChange={() => handleGameSelection(game.game_id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-2 px-4 border-b">{game.local_date}</td>
                    <td className="py-2 px-4 border-b">
                      {new Date(game.start_time.replace(' ', 'T') + 'Z').toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-4 border-b">{game.away_team.name}</td>
                    <td className="py-2 px-4 border-b">{game.home_team.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={createMarketsFromGames}
              disabled={selectedGames.length === 0 || creatingBatchMarkets}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {creatingBatchMarkets ? 'Creating...' : `Create Markets (${selectedGames.length})`}
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      
      {renderTabs()}
      
      {activeTab === 'roles' && renderRoleManagement()}
      {activeTab === 'markets' && renderMarketSection()}
      {activeTab === 'games' && renderGamesManagement()}
      
      {selectedMarketId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Resolve Market #{selectedMarketId}</h3>
            
            <div className="mb-4">
              <label className="block mb-2">Select Winning Outcome:</label>
              <select
                value={winningOutcome}
                onChange={(e) => setWinningOutcome(Number(e.target.value))}
                className="w-full p-2 border rounded"
              >
                {markets.find(m => m.id === selectedMarketId)?.outcomes.map((outcome, index) => (
                  <option key={index} value={index}>
                    {outcome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedMarketId(null)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveMarket}
                disabled={resolving}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {resolving ? 'Resolving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showCreateMarketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Create New Market</h3>
            
            <div className="mb-4">
              <label className="block mb-2">Question:</label>
              <input
                type="text"
                value={newMarket.question}
                onChange={(e) => setNewMarket({ ...newMarket, question: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="E.g., Will ETH reach $5000 by end of year?"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2">Outcomes:</label>
              {newMarket.outcomes.map((outcome, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={outcome}
                    onChange={(e) => updateOutcome(index, e.target.value)}
                    className="flex-grow p-2 border rounded"
                    placeholder={`Outcome ${index + 1}`}
                  />
                  <button
                    onClick={() => removeOutcome(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    -
                  </button>
                </div>
              ))}
              <button
                onClick={addOutcome}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                + Add Outcome
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block mb-2">End Time:</label>
              <input
                type="datetime-local"
                value={newMarket.endTime}
                onChange={(e) => setNewMarket({ ...newMarket, endTime: e.target.value })}
                className="w-full p-2 border rounded"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateMarketForm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMarket}
                disabled={creating}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Market'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 