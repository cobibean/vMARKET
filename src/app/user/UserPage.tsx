import { fetchUserMarkets, claimWinnings } from "@/app/lib/api";


async function loadUserMarkets() {
    try {
      const userId = "123";
      const markets = await fetchUserMarkets(userId);
      console.log("User Markets:", markets);
    } catch (error) {
      console.error("Error loading user markets:", error);
    }
  }
  
  async function handleClaimAll() {
    try {
      const userId = "123";
      const marketIds = [1, 2, 3];
      await claimWinnings(userId, marketIds);
      console.log("Winnings claimed successfully!");
    } catch (error) {
      console.error("Error claiming winnings:", error);
    }
  }