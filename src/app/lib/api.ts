// Only keep pure API calls and TypeScript types
const API_BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:fZMXiu9H';

// Keep only these in api.ts:
export interface Market {
  question: string;
  options: string[];
  endTime: bigint;
  outcome: number;
  totalShares: readonly bigint[];
  resolved: boolean;
}

export interface UserMarket {
  user_id: string;
  market_id: number;
  room: 'usdc' | 'vesta';
  shares: number[]; // From API as numbers
  claimed: boolean;
  created_at: string; // API returns ISO string
  market_data?: Market; // Optional populated client-side
}

// API functions only - no UI logic
export async function fetchUserMarkets(userId: string): Promise<UserMarket[]> {
  const response = await fetch(`${API_BASE_URL}/fetch-markets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!response.ok) throw new Error('Failed to fetch user markets');
  return response.json();
}

export async function batchClaimWinnings(userId: string, marketIds: number[]): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/batch-claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      user_id: userId,
      market_ids: marketIds,
      chain: 'metis' 
    }),
  });
  if (!response.ok) throw new Error('Failed to claim winnings');
  return response.json();
}

// Claim winnings for specific markets
export async function claimWinnings(userId: string, marketIds: number[]) {
  const response = await fetch(`${API_BASE_URL}/claim-winnings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, market_ids: marketIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to claim winnings');
  }

  return response.json();
}

export async function fetchUserData(userId: string) {
  const response = await fetch(`${API_BASE_URL}/get-user-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  // ... error handling
  return response.json();
}

export async function handleBatchClaim(userId: string, claimableMarkets: number[]) {
  try {
    const txReceipt = await batchClaimWinnings(userId, claimableMarkets);
    return txReceipt;
  } catch (error) {
    throw error;
  }
}