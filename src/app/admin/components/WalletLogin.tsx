"use client";

import { useState } from 'react';
import { ethers } from 'ethers';

interface WalletLoginProps {
  onConnect: (address: string) => void;
}

export default function WalletLogin({ onConnect }: WalletLoginProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    setConnecting(true);
    setError('');

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to use this feature.");
      }
      
      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      onConnect(address);
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Login</h2>
      <p className="text-gray-600 mb-6">
        Connect your wallet to access the admin dashboard. You must have admin privileges to proceed.
      </p>
      
      <button
        onClick={connectWallet}
        disabled={connecting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center disabled:bg-blue-400"
      >
        {connecting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </>
        ) : (
          <>Connect Wallet</>
        )}
      </button>
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
} 