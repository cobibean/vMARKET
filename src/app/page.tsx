"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome to vMARKET</h1>
      <p>Select a prediction market room to get started:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* USDC Room */}
        <div className="p-6 border rounded bg-gray-50">
          <h2 className="text-2xl font-semibold mb-4">Stable Predictions Room</h2>
          <p className="text-gray-600 mb-4">
            Dive into markets using USDC for stable and secure predictions.
          </p>
          <Link href="/usdc">
            <button className="bg-blue-500 text-white px-6 py-3 rounded">
              Enter USDC Room
            </button>
          </Link>
        </div>

        {/* VESTA Room */}
        <div className="p-6 border rounded bg-gray-50">
          <h2 className="text-2xl font-semibold mb-4">VESTA Predictions Room</h2>
          <p className="text-gray-600 mb-4">
            Explore the VESTA-powered prediction markets and take a chance.
          </p>
          <Link href="/vesta">
            <button className="bg-green-500 text-white px-6 py-3 rounded">
              Enter VESTA Room
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}