// app/page.tsx

"use client";

import React from 'react';
import RoomCard from '@/app/sharedComponents/roomCard';
import { FaCoins, FaExchangeAlt } from 'react-icons/fa';
import { ThemeProvider } from '@/app/context/themeContext'; // Ensure correct path

export default function HomePage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground p-8">
        {/* Dark Mode Toggle */}
        <div className="fixed top-4 right-4 z-50">
        </div>

        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-center">Welcome to vMARKET</h1>
          <p className="text-center text-lg">Select a prediction market room to get started:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* USDC Room */}
            <RoomCard
              title="Stable Room"
              description="Dive into predictions using USDC for a stable experience."
              href="/usdc"
              icon={<FaCoins size={24} />} // Passing Icon
              bgColor="bg-primary"
            />

            {/* VESTA Room */}
            <RoomCard
              title="Degen Room"
              description="Explore the VESTA-powered prediction markets."
              href="/vesta"
              icon={<FaExchangeAlt size={24} />} // Passing Icon
              bgColor="bg-accent"
            />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}