"use client";
import { useState, useEffect } from "react";
import PredictionMarketDashboard from "@/app/vesta/components/PredictionMarketDashboard";

// Disable static generation to prevent QueryClient errors during build
export const dynamic = 'force-dynamic';

export default function VestaRoomPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return <PredictionMarketDashboard room="vesta" />;
}