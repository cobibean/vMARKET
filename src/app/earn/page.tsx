"use client";

import React from "react";

const EarnPage: React.FC = () => {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-black via-gray-900 to-black text-foreground">
        <h1 className="text-4xl font-bold mb-4 animate-pulse">Coming Soon</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Exciting earning opportunities are on the way. Stay tuned!
      </p>
      <button
        onClick={() => window.history.back()}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-all"
      >
        Go Back
      </button>
    </main>
  );
};

export default EarnPage;