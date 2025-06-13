# vMarket Backend Scripts Refactoring Plan

This document outlines a comprehensive plan to refactor the vMarket admin dashboard and related components to improve maintainability, reduce duplication, and align with best practices.

## Part 1: Backend Scripts Refactoring

### Step 1: Modularize Contract Configuration

- Move contract address, ABI, and connection setup to a separate utility module
- Create a reusable provider/contract setup function
- Use environment variables properly for different environments
- Eliminate duplication of contract ABI definitions

```javascript
// Example: Create src/app/backend/utils/contractConfig.js
import "dotenv/config";
import { ethers } from "ethers";

// Constants
export const CONTRACT_ADDRESSES = {
  vesta: process.env.VESTA_CONTRACT_ADDRESS || "0x949865114535dA93823bf5515608406325b40Fc5",
  usdc: process.env.USDC_CONTRACT_ADDRESS || "0x5B45E4C00B310f1E9C951e1169C9A60fD856d186"
};

// Import ABI from a shared location
export const CONTRACT_ABI = require("../../vesta/constants/marketVestaFullABI");

// Provider setup
export function getProvider() {
  return new ethers.JsonRpcProvider(process.env.INFURA_URL || "https://sepolia.metisdevops.link");
}

// Get contract with signer
export function getSignedContract(contractType = 'vesta') {
  const provider = getProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESSES[contractType], CONTRACT_ABI, wallet);
}
```

### Step 2: Create Shared Market Utilities

- Develop a set of shared market utility functions
- Standardize input parsing and validation
- Create consistent error handling
- Share rule processing logic

```javascript
// Example: Create src/app/backend/utils/marketUtils.js
import moment from "moment-timezone";
import path from "path";
import { promises as fs } from "fs";

// Shared paths
export const RULES_PATH = path.resolve(process.env.RULES_PATH || "./public/rules.json");

// Parse options function
export function parseOptions(optionsInput) {
  try {
    const options = JSON.parse(optionsInput);
    if (!Array.isArray(options) || options.length < 2) {
      throw new Error("Options must be a JSON array with at least two items.");
    }
    return options;
  } catch (error) {
    throw new Error(`Invalid options format: ${error.message}`);
  }
}

// Parse end time function
export function parseEndTime(endTimeInput) {
  const now = Math.floor(Date.now() / 1000);
  
  if (/^\d+$/.test(endTimeInput)) {
    return parseInt(endTimeInput, 10) - now;
  } else {
    const parsedTime = moment.tz(endTimeInput, "YYYY-MM-DD HH:mm", "America/Chicago");
    if (!parsedTime.isValid()) {
      throw new Error("Invalid end time format. Use YYYY-MM-DD HH:mm or a Unix timestamp.");
    }
    return parsedTime.unix() - now;
  }
}

// Save rule function
export async function saveRule(marketId, question, rule, room = 'vesta') {
  try {
    const newRule = { marketId, question, rule, room };
    let existingRules = [];
    
    try {
      const fileContent = await fs.readFile(RULES_PATH, "utf8");
      existingRules = fileContent.trim() ? JSON.parse(fileContent) : [];
    } catch (error) {
      console.warn("Failed to read rules.json. Initializing as empty.");
    }
    
    existingRules.push(newRule);
    await fs.writeFile(RULES_PATH, JSON.stringify(existingRules, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error saving rule:", error);
    return false;
  }
}
```

### Step 3: Refactor createMarketVesta.js

- Refactor the script to use the new utility modules
- Improve command-line argument handling
- Add better error handling and logging
- Make the script more maintainable

```javascript
// Example refactored createMarketVesta.js
import { getSignedContract } from "./utils/contractConfig.js";
import { parseOptions, parseEndTime, saveRule } from "./utils/marketUtils.js";

// Process command line arguments
const [,, question, optionsInput, endTimeInput, rule, room = 'vesta'] = process.argv;

if (!question || !optionsInput || !endTimeInput || !rule) {
  console.error(
    "Usage: node createMarketVesta.js <question> <options> <endTime> <rule> [room]\n" +
    'Example: node createMarketVesta.js "Will TikTok be banned?" \'["Yes", "No"]\' "2025-05-01 14:00" "Market resolves as Yes if TikTok is banned before May 2025." "vesta"'
  );
  process.exit(1);
}

async function createMarket() {
  try {
    // Parse inputs
    const options = parseOptions(optionsInput);
    const duration = parseEndTime(endTimeInput);
    
    if (duration <= 0) {
      console.error("End time must be in the future.");
      process.exit(1);
    }
    
    console.log("Creating market with the following details:");
    console.log(`Question: ${question}`);
    console.log(`Options: ${JSON.stringify(options)}`);
    console.log(`Duration (in seconds): ${duration}`);
    console.log(`Rule: ${rule}`);
    console.log(`Room: ${room}`);
    
    // Get contract and create market
    const contract = getSignedContract(room);
    const tx = await contract.createMarket(question, options, duration);
    console.log("Transaction submitted. Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt.transactionHash);
    
    // Extract marketId from logs
    const event = receipt.logs.find((log) =>
      log.topics[0] === ethers.id("MarketCreated(uint256,string,string[],uint256)")
    );
    const marketId = event ? parseInt(event.topics[1], 16) : null;
    
    if (!marketId) {
      console.error("Market ID not found in transaction logs.");
      return;
    }
    
    console.log("Market created with ID:", marketId);
    
    // Save rule
    const ruleAdded = await saveRule(marketId, question, rule, room);
    if (ruleAdded) {
      console.log("Rule successfully written to rules.json");
    } else {
      console.error("Failed to write rule to rules.json");
    }
    
  } catch (error) {
    console.error("Error creating market:", error);
    process.exit(1);
  }
}

createMarket();
```

### Step 4: Integrate with Admin Dashboard

- Connect the refactored scripts with the admin dashboard
- Create a shared module to handle both CLI and API calls
- Update related API routes to use the shared modules
- Document the new approach

```javascript
// Example: Create src/app/backend/services/marketService.js
import { getSignedContract } from "../utils/contractConfig.js";
import { parseOptions, parseEndTime, saveRule } from "../utils/marketUtils.js";
import { ethers } from "ethers";

// Create market function that can be used by both CLI and API
export async function createMarketService(question, options, endTime, rule, room = 'vesta') {
  try {
    let parsedOptions, duration;
    
    // Handle different input types (API might send objects, CLI sends strings)
    if (typeof options === 'string') {
      parsedOptions = parseOptions(options);
    } else if (Array.isArray(options)) {
      parsedOptions = options;
    } else {
      throw new Error("Invalid options format");
    }
    
    // Handle different endTime formats
    if (typeof endTime === 'string') {
      duration = parseEndTime(endTime);
    } else if (typeof endTime === 'number') {
      duration = endTime;
    } else {
      throw new Error("Invalid endTime format");
    }
    
    if (duration <= 0) {
      throw new Error("End time must be in the future");
    }
    
    // Create the market
    const contract = getSignedContract(room);
    const tx = await contract.createMarket(question, parsedOptions, duration);
    const receipt = await tx.wait();
    
    // Extract marketId
    const event = receipt.logs.find((log) =>
      log.topics[0] === ethers.id("MarketCreated(uint256,string,string[],uint256)")
    );
    const marketId = event ? parseInt(event.topics[1], 16) : null;
    
    if (!marketId) {
      throw new Error("Market ID not found in transaction logs");
    }
    
    // Save rule
    await saveRule(marketId, question, rule, room);
    
    return {
      success: true,
      marketId,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error("Error in market service:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

## Part 2: Admin Dashboard Frontend Refactoring

### Step 5: Component Size Refactoring

The AdminDashboard.tsx file is approximately 700 lines long and handles too many responsibilities. Breaking it down into smaller, focused components will improve:

- Maintainability
- Reusability 
- Testability
- Developer experience

Proposed component structure:

```
src/app/admin/components/
├── Dashboard/
│   ├── Dashboard.tsx             # Main container, handles tabs
│   ├── index.ts                  # Export file
│   └── types.ts                  # Shared types
├── Markets/
│   ├── MarketList.tsx            # List of all markets
│   ├── MarketTable.tsx           # Table component for markets
│   ├── MarketDetail.tsx          # View for a single market
│   ├── ResolveMarketForm.tsx     # Form for resolving markets
│   ├── CreateMarketForm.tsx      # Form for creating markets
│   └── index.ts
├── Roles/
│   ├── RoleManagement.tsx        # Role management panel
│   ├── AdminList.tsx             # List of admins
│   ├── ResolverList.tsx          # List of resolvers
│   └── index.ts
├── Games/
│   ├── GamesPanel.tsx            # Games management panel
│   ├── GamesList.tsx             # List of games
│   ├── LeagueSelector.tsx        # League selection component
│   ├── BatchMarketCreation.tsx   # Interface for batch creating markets
│   └── index.ts
└── shared/
    ├── LoadingSpinner.tsx        # Reusable loading indicator
    ├── ErrorDisplay.tsx          # Error handling component
    ├── ActionButton.tsx          # Styled button for actions
    └── FormElements.tsx          # Common form elements
```

Example refactoring for the Markets section:

```tsx
// src/app/admin/components/Markets/MarketList.tsx
import React, { useState } from 'react';
import MarketTable from './MarketTable';
import CreateMarketForm from './CreateMarketForm';
import { Market } from '../Dashboard/types';

interface MarketListProps {
  markets: Market[];
  onRefreshMarkets: () => Promise<void>;
  isLoading: boolean;
}

export function MarketList({ markets, onRefreshMarkets, isLoading }: MarketListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Markets</h2>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setShowCreateForm(true)}
        >
          Create Market
        </button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4">Loading markets...</div>
      ) : (
        <MarketTable markets={markets} onRefreshMarkets={onRefreshMarkets} />
      )}
      
      {showCreateForm && (
        <CreateMarketForm
          onClose={() => setShowCreateForm(false)} 
          onSuccess={() => {
            setShowCreateForm(false);
            onRefreshMarkets();
          }}
        />
      )}
    </div>
  );
}
```

### Step 6: API Routes Consolidation

The current API routes are highly fragmented with many small route handlers. Consolidating related functionality will improve maintainability.

Current structure:
```
src/app/api/admin/
├── setup-db/
├── games/
├── analytics/
├── get-markets/
├── resolve-markets/
├── create-markets/
└── fetch-games/
```

Proposed structure:
```
src/app/api/admin/
├── markets/
│   ├── route.ts      # All market CRUD operations (GET, POST, PUT, DELETE)
│   └── [id]/route.ts # Single market operations
├── roles/
│   └── route.ts      # Role management endpoints
├── games/
│   ├── route.ts      # Game management endpoints
│   └── [league]/route.ts # League-specific game operations
└── analytics/
    └── route.ts      # Analytics endpoints
```

Example implementation for consolidated markets API:

```typescript
// src/app/api/admin/markets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMarketService } from '@/app/backend/services/marketService';

export async function GET(req: NextRequest) {
  // Get markets with optional query params
  const searchParams = req.nextUrl.searchParams;
  const state = searchParams.get('state');
  
  try {
    // Use the contract service to get markets
    const markets = await getMarkets(state);
    return NextResponse.json({ success: true, markets });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Create a new market
  try {
    const body = await req.json();
    const { question, options, endTime, rule, room } = body;
    
    // Validate inputs
    if (!question || !options || !endTime || !rule) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }
    
    // Use the market service to create the market
    const result = await createMarketService(question, options, endTime, rule, room);
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

### Step 7: Contract ABI Centralization

Contract ABIs are currently duplicated across multiple files, including:
- Backend scripts (createMarketVesta.js, createMarketUsdc.mjs)
- Contract utilities (src/app/vesta/utils/contract.ts)
- API route handlers

Proposed solution:

1. Create a central location for all ABIs:

```
src/app/shared/contracts/
├── abis/
│   ├── marketVestaABI.ts    # Main vesta contract ABI
│   ├── marketUsdcABI.ts     # USDC contract ABI
│   └── index.ts             # Exports all ABIs
└── addresses.ts             # Contract addresses by network
```

2. Update imports across the codebase:

```typescript
// src/app/shared/contracts/abis/index.ts
export { default as marketVestaABI } from './marketVestaABI';
export { default as marketUsdcABI } from './marketUsdcABI';

// src/app/shared/contracts/addresses.ts
export const ADDRESSES = {
  vesta: {
    mainnet: '0x949865114535dA93823bf5515608406325b40Fc5',
    testnet: '0x...'
  },
  usdc: {
    mainnet: '0x5B45E4C00B310f1E9C951e1169C9A60fD856d186',
    testnet: '0x...'
  }
};

// Example usage in utils:
import { marketVestaABI } from '@/app/shared/contracts/abis';
import { ADDRESSES } from '@/app/shared/contracts/addresses';

export function getContract(contractType = 'vesta', network = 'mainnet') {
  return new ethers.Contract(
    ADDRESSES[contractType][network],
    contractType === 'vesta' ? marketVestaABI : marketUsdcABI,
    provider
  );
}
```

### Step 8: Implement State Management

The admin dashboard currently uses local React state for everything, which leads to prop drilling and makes it harder to share state between components.

Recommended approach:

1. Implement React Context for domain-specific state:

```tsx
// src/app/admin/context/MarketContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Market, MarketState } from '../types';
import { getAllMarkets, resolveMarket, createMarket } from '@/app/vesta/utils/contract';

interface MarketContextProps {
  markets: Market[];
  loading: boolean;
  error: string | null;
  fetchMarkets: () => Promise<void>;
  resolveMarketById: (marketId: number, outcome: number) => Promise<boolean>;
  createNewMarket: (question: string, outcomes: string[], endTime: number) => Promise<boolean>;
}

const MarketContext = createContext<MarketContextProps | undefined>(undefined);

export function MarketProvider({ children }: { children: ReactNode }) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const resolveMarketById = async (marketId: number, outcome: number) => {
    try {
      await resolveMarket(marketId, outcome);
      await fetchMarkets();
      return true;
    } catch (err) {
      setError('Failed to resolve market. Please try again.');
      console.error(err);
      return false;
    }
  };

  const createNewMarket = async (question: string, outcomes: string[], endTime: number) => {
    try {
      await createMarket(question, outcomes, endTime);
      await fetchMarkets();
      return true;
    } catch (err) {
      setError('Failed to create market. Please try again.');
      console.error(err);
      return false;
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  return (
    <MarketContext.Provider value={{
      markets,
      loading,
      error,
      fetchMarkets,
      resolveMarketById,
      createNewMarket
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarkets() {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error('useMarkets must be used within a MarketProvider');
  }
  return context;
}
```

2. Use the context in components:

```tsx
// src/app/admin/components/Dashboard/Dashboard.tsx
import { MarketProvider } from '../../context/MarketContext';
import { RoleProvider } from '../../context/RoleContext';
import { GamesProvider } from '../../context/GamesContext';

export function Dashboard({ address }: { address: string }) {
  return (
    <MarketProvider>
      <RoleProvider>
        <GamesProvider>
          {/* Dashboard content */}
        </GamesProvider>
      </RoleProvider>
    </MarketProvider>
  );
}

// src/app/admin/components/Markets/MarketList.tsx
import { useMarkets } from '../../context/MarketContext';

export function MarketList() {
  const { markets, loading, error, fetchMarkets } = useMarkets();
  
  // No need to pass markets as props anymore
  return (
    <div className="space-y-6">
      {/* Component content */}
    </div>
  );
}
```

## Implementation Timeline

1. **Week 1**: Backend scripts refactoring (Steps 1-4)
   - Modularize contract configuration
   - Create shared market utilities
   - Refactor createMarketVesta.js
   - Create market service

2. **Week 2**: Frontend component refactoring (Step 5)
   - Break down AdminDashboard.tsx into smaller components
   - Implement component directory structure
   - Write tests for critical components

3. **Week 3**: API route consolidation and ABI centralization (Steps 6-7)
   - Reorganize API routes
   - Centralize contract ABIs
   - Update imports across the codebase

4. **Week 4**: State management implementation (Step 8)
   - Implement context providers
   - Refactor components to use context
   - Test and fix any integration issues

This comprehensive refactoring plan will significantly improve the maintainability of the codebase, reduce duplication, and create a more modular structure that can be easily extended in the future. 