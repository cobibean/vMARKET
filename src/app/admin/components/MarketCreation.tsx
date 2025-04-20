"use client";

import { useState } from 'react';
import APIBasedCreation from './market-creation/APIBasedCreation';
import ManualCreation from './market-creation/ManualCreation';
interface MarketCreationProps {
  address: string;
}

type CreationTab = 'api' | 'manual';

export default function MarketCreation({ address }: MarketCreationProps) {
  const [activeTab, setActiveTab] = useState<CreationTab>('api');

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Create Markets</h3>
      
      {/* Sub-tabs for creation methods */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('api')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm 
              ${activeTab === 'api' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            API-Based Creation
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'manual' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            Manual Creation
          </button>
        </nav>
      </div>
      
      {/* Content based on active tab */}
      <div>
        {activeTab === 'api' ? (
          <APIBasedCreation address={address} />
        ) : (
          <ManualCreation address={address} />
        )}
      </div>
    </div>
  );
} 