"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { isAdmin } from '@/app/vesta/utils/contract';

interface WalletLoginProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
  onAuthChange: (isAuthorized: boolean) => void;
}

const WalletLogin: React.FC<WalletLoginProps> = ({ onConnect, onDisconnect, onAuthChange }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we have a stored account on component mount
  useEffect(() => {
    const storedAccount = localStorage.getItem('walletAccount');
    if (storedAccount) {
      setAccount(storedAccount);
      onConnect(storedAccount);
      checkAdminStatus(storedAccount);
    }
  }, [onConnect]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const ethereum = window.ethereum as any;
      ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          handleDisconnect();
        } else {
          // Account changed
          const newAccount = accounts[0];
          setAccount(newAccount);
          localStorage.setItem('walletAccount', newAccount);
          onConnect(newAccount);
          checkAdminStatus(newAccount);
        }
      });
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const ethereum = window.ethereum as any;
        ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [onConnect]);

  const checkAdminStatus = async (address: string) => {
    try {
      const isAuthorized = await isAdmin(address);
      onAuthChange(isAuthorized);
      if (!isAuthorized) {
        setError('You do not have admin privileges');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      setError('Error checking admin status');
      onAuthChange(false);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const ethereum = window.ethereum as any;
      const provider = new ethers.BrowserProvider(ethereum);
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const connectedAccount = accounts[0];
      setAccount(connectedAccount);
      localStorage.setItem('walletAccount', connectedAccount);
      onConnect(connectedAccount);
      
      // Check if the connected account has admin privileges
      await checkAdminStatus(connectedAccount);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      onAuthChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('walletAccount');
    setAccount(null);
    setError(null);
    onDisconnect();
    onAuthChange(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {account ? (
        <div className="bg-white shadow-md rounded-lg p-6 mt-4">
          <p className="text-gray-700 mb-2">
            Connected: <span className="font-mono text-sm break-all">{account}</span>
          </p>
          <button
            onClick={handleDisconnect}
            className="w-full mt-2 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Disconnect Wallet
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6 mt-4">
          <p className="text-gray-700 mb-4">
            Connect your wallet to access admin features
          </p>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletLogin; 