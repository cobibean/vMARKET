"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import marketVestaABI from '../../vesta/constants/marketVestaABI';

interface RoleManagementProps {
  address: string;
}

interface Role {
  name: string;
  label: string;
  members: string[];
}

// Contract address - should be in an environment variable in production
const CONTRACT_ADDRESS = "0x949865114535dA93823bf5515608406325b40Fc5";

export default function RoleManagement({ address }: RoleManagementProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize ethers contract when component mounts
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, provider);
        
        const adminRole = await contract.DEFAULT_ADMIN_ROLE();
        const hasAdminRole = await contract.hasRole(adminRole, address);
        
        setIsAdmin(hasAdminRole);
        
        if (hasAdminRole) {
          fetchRoles();
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setError('Failed to check admin permissions. Please try again.');
      }
    };
    
    checkAdminStatus();
  }, [address]);

  // Fetch all roles and their members
  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, provider);
      
      // Define roles to fetch
      const roleData = [
        { name: await contract.DEFAULT_ADMIN_ROLE(), label: 'Admin' },
        { name: await contract.MARKET_CREATOR_ROLE(), label: 'Market Creator' },
        { name: await contract.MARKET_RESOLVER_ROLE(), label: 'Market Resolver' }
      ];
      
      // For each role, fetch all members
      const rolesWithMembers = await Promise.all(
        roleData.map(async (role) => {
          const count = await contract.getRoleMemberCount(role.name);
          
          const members = [];
          for (let i = 0; i < count; i++) {
            const member = await contract.getRoleMember(role.name, i);
            members.push(member);
          }
          
          return { ...role, members };
        })
      );
      
      setRoles(rolesWithMembers);
    } catch (err: Error | unknown) {
      console.error('Error fetching roles:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error fetching roles. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Grant role to new address
  const grantRole = async () => {
    if (!selectedRole) {
      setError('Please select a role to grant');
      return;
    }
    
    if (!ethers.isAddress(newMemberAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, signer);
      
      // Check if user has admin role
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      const hasAdminRole = await contract.hasRole(adminRole, address);
      
      if (!hasAdminRole) {
        throw new Error('You do not have permission to grant roles');
      }
      
      // Find the role bytes32 value
      const role = roles.find(r => r.label === selectedRole)?.name;
      
      if (!role) {
        throw new Error('Selected role not found');
      }
      
      const tx = await contract.grantRole(role, newMemberAddress);
      setSuccess('Transaction submitted. Waiting for confirmation...');
      
      await tx.wait();
      setSuccess(`Successfully granted ${selectedRole} role to ${newMemberAddress}`);
      
      // Refresh roles
      fetchRoles();
      
      // Reset form
      setNewMemberAddress('');
      setSelectedRole(null);
    } catch (err: Error | unknown) {
      console.error('Error granting role:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error granting role. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Revoke role from address
  const revokeRole = async (roleName: string, memberAddress: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, marketVestaABI, signer);
      
      // Check if user has admin role
      const adminRole = await contract.DEFAULT_ADMIN_ROLE();
      const hasAdminRole = await contract.hasRole(adminRole, address);
      
      if (!hasAdminRole) {
        throw new Error('You do not have permission to revoke roles');
      }
      
      // Find the role bytes32 value
      const role = roles.find(r => r.label === roleName)?.name;
      
      if (!role) {
        throw new Error('Role not found');
      }
      
      const tx = await contract.revokeRole(role, memberAddress);
      setSuccess('Transaction submitted. Waiting for confirmation...');
      
      await tx.wait();
      setSuccess(`Successfully revoked ${roleName} role from ${memberAddress}`);
      
      // Refresh roles
      fetchRoles();
    } catch (err: Error | unknown) {
      console.error('Error revoking role:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error revoking role. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if the current user is eligible to revoke
  const canRevoke = (roleLabel: string, memberAddress: string) => {
    // Don't allow revoking your own admin role
    if (roleLabel === 'Admin' && memberAddress.toLowerCase() === address.toLowerCase()) {
      return false;
    }
    return true;
  };

  if (!isAdmin) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-600">Access Denied</h2>
        <p className="mt-2 text-gray-600">
          Only users with the Admin role can manage roles. Your wallet does not have 
          the required permission.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Manage Roles</h3>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <p className="text-sm text-gray-600">
          As an admin, you can grant and revoke roles to other addresses. There are three roles in the system:
          <span className="block mt-2">• <strong>Admin:</strong> Can manage roles and perform all actions</span>
          <span className="block">• <strong>Market Creator:</strong> Can create new markets</span>
          <span className="block">• <strong>Market Resolver:</strong> Can resolve markets</span>
        </p>
      </div>
      
      {/* Grant Role Form */}
      <div className="bg-white p-4 rounded-md border border-gray-200 mb-8">
        <h4 className="font-medium text-gray-800 mb-4">Grant Role</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              value={selectedRole || ''}
              onChange={(e) => setSelectedRole(e.target.value || null)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select a role</option>
              <option value="Admin">Admin</option>
              <option value="Market Creator">Market Creator</option>
              <option value="Market Resolver">Market Resolver</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Wallet Address
            </label>
            <input
              type="text"
              id="address"
              value={newMemberAddress}
              onChange={(e) => setNewMemberAddress(e.target.value)}
              placeholder="0x..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={grantRole}
            disabled={loading || !selectedRole || !newMemberAddress}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-blue-400"
          >
            {loading ? 'Processing...' : 'Grant Role'}
          </button>
        </div>
      </div>
      
      {/* Role Lists */}
      {loading && roles.length === 0 ? (
        <div className="text-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading roles...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {roles.map((role) => (
            <div key={role.label} className="bg-white p-4 rounded-md border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">
                {role.label} Role
                <span className="ml-2 text-xs text-gray-500">
                  ({role.members.length} member{role.members.length !== 1 ? 's' : ''})
                </span>
              </h4>
              
              {role.members.length === 0 ? (
                <p className="text-sm text-gray-500">No members with this role</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {role.members.map((member) => (
                    <li key={member} className="py-3 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="font-mono text-gray-700">{member}</span>
                        {member.toLowerCase() === address.toLowerCase() && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-md">
                            You
                          </span>
                        )}
                      </div>
                      
                      {canRevoke(role.label, member) && (
                        <button
                          onClick={() => revokeRole(role.label, member)}
                          disabled={loading}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Revoke
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Status Messages */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-700">{success}</p>
        </div>
      )}
    </div>
  );
} 