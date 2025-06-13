import { create } from 'zustand';
import { persist, type PersistOptions, type StateStorage } from 'zustand/middleware';
import { MarketOutcome, MarketStatus } from '@/components/market/MarketCard';

export interface Market {
  id: string;
  title: string;
  description: string;
  outcomes: MarketOutcome[];
  status: MarketStatus;
  endTime?: Date;
  volume: number;
  liquidity: number;
  createdBy: string;
  createdAt: Date;
  category: string;
  tags: string[];
}

interface MarketsState {
  markets: Market[];
  selectedMarket: Market | null;
  isLoading: boolean;
  error: string | null;
  fetchMarkets: () => Promise<void>;
  selectMarket: (id: string) => void;
  clearSelectedMarket: () => void;
  filterMarketsByStatus: (status: MarketStatus) => Market[];
  filterMarketsByCategory: (category: string) => Market[];
  searchMarkets: (query: string) => Market[];
}

type MarketsStatePersist = {
  markets: Market[];
  selectedMarket: Market | null;
};

// Mock data generation functions
const generateRandomOutcomes = (): MarketOutcome[] => {
  const count = Math.floor(Math.random() * 3) + 2; // 2-4 outcomes
  const outcomes: MarketOutcome[] = [];
  
  for (let i = 0; i < count; i++) {
    const probability = i === 0 ? Math.random() * 0.6 + 0.2 : Math.random() * 0.3;
    outcomes.push({
      id: `outcome-${i}`,
      name: ['Yes', 'No', 'Maybe', 'Uncertain', 'Likely', 'Unlikely'][i % 6],
      price: probability * 100,
      probability,
    });
  }
  
  // Normalize probabilities to sum to 1
  const totalProbability = outcomes.reduce((sum, o) => sum + o.probability, 0);
  return outcomes.map(o => ({
    ...o,
    probability: o.probability / totalProbability
  }));
};

const generateMockMarkets = (): Market[] => {
  const marketTitles = [
    "Will Bitcoin reach $100,000 by end of year?",
    "Will Ethereum transition to PoS in Q3?",
    "Will the Fed raise interest rates in July?",
    "Will the S&P 500 close above 5000 by September?",
    "Will inflation drop below 3% this year?",
    "Will Tesla stock split in 2024?",
    "Will SpaceX reach Mars by 2026?",
    "Will AI regulation pass in the US this year?",
    "Will NFT trading volume increase in Q4?",
    "Will a new crypto enter the top 5 by market cap?"
  ];
  
  const categories = ["Crypto", "Finance", "Politics", "Tech", "Sports"];
  
  return marketTitles.map((title, index) => {
    const now = new Date();
    const category = categories[index % categories.length];
    const daysToAdd = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
    
    const endTime = new Date(now);
    endTime.setDate(endTime.getDate() + Math.abs(daysToAdd));
    
    let status: MarketStatus = 'active';
    if (daysToAdd < -15) status = 'resolved';
    else if (daysToAdd < 0) status = 'active';
    else status = 'pending';
    
    return {
      id: `market-${index}`,
      title,
      description: `This market predicts the outcome of ${title.toLowerCase()}`,
      outcomes: generateRandomOutcomes(),
      status,
      endTime,
      volume: Math.random() * 100000,
      liquidity: Math.random() * 50000,
      createdBy: `0x${Math.random().toString(16).slice(2, 10)}`,
      createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      category,
      tags: [category, status, daysToAdd < 0 ? 'ending-soon' : 'upcoming'],
    };
  });
};

// Define persist config type
type MarketsPersistConfig = PersistOptions<
  MarketsState,
  MarketsStatePersist
>;

// Create the persist config
const persistConfig: MarketsPersistConfig = {
  name: 'vmarket-markets-storage',
  partialize: (state) => ({ 
    markets: state.markets,
    selectedMarket: state.selectedMarket 
  }),
};

export const useMarketsStore = create<MarketsState>()(
  persist(
    (set, get) => ({
      markets: [],
      selectedMarket: null,
      isLoading: false,
      error: null,
      
      fetchMarkets: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, this would be an API call
          // Simulating API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate mock data
          const markets = generateMockMarkets();
          set({ markets, isLoading: false });
        } catch (err) {
          set({ 
            error: err instanceof Error ? err.message : 'An unknown error occurred', 
            isLoading: false 
          });
        }
      },
      
      selectMarket: (id: string) => {
        const { markets } = get();
        const selectedMarket = markets.find((market: Market) => market.id === id) || null;
        set({ selectedMarket });
      },
      
      clearSelectedMarket: () => {
        set({ selectedMarket: null });
      },
      
      filterMarketsByStatus: (status: MarketStatus) => {
        const { markets } = get();
        return markets.filter((market: Market) => market.status === status);
      },
      
      filterMarketsByCategory: (category: string) => {
        const { markets } = get();
        return markets.filter((market: Market) => market.category === category);
      },
      
      searchMarkets: (query: string) => {
        const { markets } = get();
        const lowercaseQuery = query.toLowerCase();
        
        return markets.filter((market: Market) => 
          market.title.toLowerCase().includes(lowercaseQuery) || 
          market.description.toLowerCase().includes(lowercaseQuery) ||
          market.category.toLowerCase().includes(lowercaseQuery) ||
          market.tags.some((tag: string) => tag.toLowerCase().includes(lowercaseQuery))
        );
      },
    }),
    persistConfig
  )
); 