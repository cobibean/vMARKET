const API_BASE_URL = 'https://x8ki-letl-twmt.n7.xano.io/api:fZMXiu9H';

// Fetch all markets for a specific user
export async function fetchUserMarkets(userId: string) {
  const response = await fetch(`${API_BASE_URL}/fetch-markets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user markets');
  }

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