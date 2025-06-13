import React, { useState } from 'react';
import { ActionButton, ErrorDisplay } from '../shared';

interface RoleManagementProps {
  onAddAdmin: (address: string) => Promise<void>;
  onRemoveAdmin: (address: string) => Promise<void>;
  onAddResolver: (address: string) => Promise<void>;
  onRemoveResolver: (address: string) => Promise<void>;
  error: string | null;
}

export default function RoleManagement({
  onAddAdmin,
  onRemoveAdmin,
  onAddResolver,
  onRemoveResolver,
  error
}: RoleManagementProps) {
  const [roleAddress, setRoleAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRoleAction = async (action: 'addAdmin' | 'removeAdmin' | 'addResolver' | 'removeResolver') => {
    if (!roleAddress) {
      setLocalError('Please enter a wallet address');
      return;
    }
    
    // Basic validation for Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(roleAddress)) {
      setLocalError('Please enter a valid Ethereum address');
      return;
    }
    
    try {
      setIsProcessing(true);
      setLocalError(null);
      
      switch (action) {
        case 'addAdmin':
          await onAddAdmin(roleAddress);
          break;
        case 'removeAdmin':
          await onRemoveAdmin(roleAddress);
          break;
        case 'addResolver':
          await onAddResolver(roleAddress);
          break;
        case 'removeResolver':
          await onRemoveResolver(roleAddress);
          break;
      }
      
      setRoleAddress('');
    } catch (err) {
      setLocalError(`Failed to ${action}. Please try again.`);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Role Management</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Wallet Address"
            value={roleAddress}
            onChange={(e) => setRoleAddress(e.target.value)}
            className="flex-grow px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {(error || localError) && <ErrorDisplay message={error || localError} className="mb-4" />}
        
        <div className="grid grid-cols-2 gap-4">
          <ActionButton 
            onClick={() => handleRoleAction('addAdmin')}
            disabled={isProcessing}
            variant="primary"
          >
            Add Admin
          </ActionButton>
          <ActionButton 
            onClick={() => handleRoleAction('removeAdmin')}
            disabled={isProcessing}
            variant="danger"
          >
            Remove Admin
          </ActionButton>
          <ActionButton 
            onClick={() => handleRoleAction('addResolver')}
            disabled={isProcessing}
            variant="success"
          >
            Add Resolver
          </ActionButton>
          <ActionButton 
            onClick={() => handleRoleAction('removeResolver')}
            disabled={isProcessing}
            variant="warning"
          >
            Remove Resolver
          </ActionButton>
        </div>
      </div>
    </div>
  );
} 