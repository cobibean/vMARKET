import PredictionMarketDashboard from "@/app/usdc/components/PredictionMarketDashboard";

// Disable static generation to prevent QueryClient errors during build
export const dynamic = 'force-dynamic';

export default function UsdcRoomPage() {
  return <PredictionMarketDashboard room="usdc" />;
}