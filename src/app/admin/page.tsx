"use client";

import React, { useState, useEffect } from 'react';
import { isAdmin } from '../vesta/utils/contract';
import Link from 'next/link';
import { Dashboard } from './components/Dashboard';

declare global {
  interface Window {
    ethereum: {
      request: (args: {method: string, params?: any[]}) => Promise<any>;
      on: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      [key: string]: any;
    };
  }
}

export default function AdminPage() {
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Check if MetaMask is connected
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          setConnectedAddress(address);
          
          // Check if this address is an admin
          try {
            const adminStatus = await isAdmin(address);
            console.log('Admin status result:', adminStatus);
            setIsAuthorized(adminStatus);
            setErrorMessage(null);
          } catch (err: Error | unknown) {
            console.error('Error checking admin status:', err);
            setIsAuthorized(false);
            setErrorMessage(`Error checking admin privileges: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }
      } catch (err: Error | unknown) {
        console.error('Error checking connection:', err);
        setErrorMessage(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setErrorMessage('MetaMask not detected. Please install MetaMask to use this feature.');
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setConnectedAddress(address);
        
        // Check if this address is an admin
        try {
          const adminStatus = await isAdmin(address);
          console.log('Admin status result after connect:', adminStatus);
          setIsAuthorized(adminStatus);
          setErrorMessage(null);
        } catch (err: Error | unknown) {
          console.error('Error checking admin status after connect:', err);
          setIsAuthorized(false);
          setErrorMessage(`Error checking admin privileges: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      } catch (err: Error | unknown) {
        console.error('Error connecting wallet:', err);
        setErrorMessage(`Wallet connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } else {
      alert('Please install MetaMask to use this feature!');
      setErrorMessage('MetaMask not detected. Please install MetaMask to use this feature.');
    }
  };
  
  const disconnectWallet = () => {
    setConnectedAddress(null);
    setIsAuthorized(false);
    setErrorMessage(null);
  };

  const AdminNavbar = () => (
    <nav className="bg-gray-800 text-white mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="font-bold text-xl">vMarket Admin</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                  Home
                </Link>
                <Link href="/admin" className="bg-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Admin Dashboard
                </Link>
              </div>
            </div>
          </div>
          {connectedAddress && (
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {connectedAddress.substring(0, 6)}...{connectedAddress.substring(connectedAddress.length - 4)}
              </span>
              <button 
                onClick={disconnectWallet}
                className="text-sm bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!connectedAddress) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <p className="mb-4">Please connect your wallet to access the admin dashboard.</p>
        <button 
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
        {errorMessage && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-6">Access Denied</h1>
        <p className="mb-4">
          The connected wallet address ({connectedAddress}) does not have admin privileges.
        </p>
        {errorMessage && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <p>{errorMessage}</p>
            <p className="mt-2 text-sm">
              Contract address being used: 
              <code className="ml-1 bg-gray-200 text-red-800 px-1 rounded">
                0x949865114535dA93823bf5515608406325b40Fc5
              </code>
            </p>
          </div>
        )}
        <button 
          onClick={disconnectWallet}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Disconnect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Dashboard address={connectedAddress} />
      </div>
    </div>
  );
} 