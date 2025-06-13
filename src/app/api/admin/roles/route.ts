import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Contract address and connection details
const CONTRACT_ADDRESS = process.env.VESTA_CONTRACT_ADDRESS || "0x949865114535dA93823bf5515608406325b40Fc5";
const INFURA_URL = process.env.INFURA_URL || 'https://andromeda.metis.io/?owner=1088';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

// Role-related contract functions
const ROLE_ABI = [
  "function MARKET_CREATOR_ROLE() view returns (bytes32)",
  "function MARKET_RESOLVER_ROLE() view returns (bytes32)",
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
  "function getRoleMemberCount(bytes32 role) view returns (uint256)",
  "function getRoleMember(bytes32 role, uint256 index) view returns (address)"
];

// Function to verify if user is an admin
async function verifyAdmin(address: string) {
  try {
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ROLE_ABI, provider);
    
    const adminRole = await contract.DEFAULT_ADMIN_ROLE();
    const hasRole = await contract.hasRole(adminRole, address);
    return hasRole;
  } catch (error) {
    console.error('Error verifying admin:', error);
    return false;
  }
}

// Get role data
async function getRoleData() {
  try {
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ROLE_ABI, provider);
    
    // Get role identifiers
    const adminRole = await contract.DEFAULT_ADMIN_ROLE();
    const creatorRole = await contract.MARKET_CREATOR_ROLE();
    const resolverRole = await contract.MARKET_RESOLVER_ROLE();
    
    // Get admin members
    const adminCount = await contract.getRoleMemberCount(adminRole);
    const admins = [];
    for (let i = 0; i < adminCount; i++) {
      const adminAddress = await contract.getRoleMember(adminRole, i);
      admins.push(adminAddress);
    }
    
    // Get creator members
    const creatorCount = await contract.getRoleMemberCount(creatorRole);
    const creators = [];
    for (let i = 0; i < creatorCount; i++) {
      const creatorAddress = await contract.getRoleMember(creatorRole, i);
      creators.push(creatorAddress);
    }
    
    // Get resolver members
    const resolverCount = await contract.getRoleMemberCount(resolverRole);
    const resolvers = [];
    for (let i = 0; i < resolverCount; i++) {
      const resolverAddress = await contract.getRoleMember(resolverRole, i);
      resolvers.push(resolverAddress);
    }
    
    return {
      admins,
      creators,
      resolvers
    };
  } catch (error) {
    console.error('Error getting role data:', error);
    throw error;
  }
}

/**
 * GET /api/admin/roles
 * Get all users with roles
 */
export async function GET(req: NextRequest) {
  try {
    const roleData = await getRoleData();
    
    return NextResponse.json({
      success: true,
      roles: roleData
    });
  } catch (error: Error | unknown) {
    console.error('Error fetching roles:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch roles';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/admin/roles
 * Grant or revoke a role
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { address, callerAddress, role, action } = body;
    
    // Validate inputs
    if (!address || !callerAddress || !role || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: address, callerAddress, role, and action are required'
      }, { status: 400 });
    }
    
    // Verify caller is an admin
    const isAdmin = await verifyAdmin(callerAddress);
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Only admins can manage roles'
      }, { status: 403 });
    }
    
    // Set up wallet and contract
    if (!PRIVATE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: Missing private key'
      }, { status: 500 });
    }
    
    const provider = new ethers.JsonRpcProvider(INFURA_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ROLE_ABI, wallet);
    
    // Get role bytes32
    let roleBytes32;
    if (role === 'admin') {
      roleBytes32 = await contract.DEFAULT_ADMIN_ROLE();
    } else if (role === 'creator') {
      roleBytes32 = await contract.MARKET_CREATOR_ROLE();
    } else if (role === 'resolver') {
      roleBytes32 = await contract.MARKET_RESOLVER_ROLE();
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid role: must be admin, creator, or resolver'
      }, { status: 400 });
    }
    
    // Execute action
    let tx;
    if (action === 'grant') {
      tx = await contract.grantRole(roleBytes32, address);
    } else if (action === 'revoke') {
      tx = await contract.revokeRole(roleBytes32, address);
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action: must be grant or revoke'
      }, { status: 400 });
    }
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return NextResponse.json({
      success: true,
      transactionHash: receipt.hash,
      action: action,
      role: role,
      address: address
    });
    
  } catch (error: Error | unknown) {
    console.error('Error managing role:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to manage role';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
} 