import PredictionMarketDashboard from "@/app/vesta/components/PredictionMarketDashboard";

// Disable static generation to prevent QueryClient errors during build
export const dynamic = 'force-dynamic';

export default function VestaRoomPage() {
  return <PredictionMarketDashboard room="vesta" />;
}