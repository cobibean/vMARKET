# vMarket Admin Dashboard

## Overview

The vMarket Admin Dashboard is a comprehensive management interface for the vMarket prediction market platform. It provides administrators with tools to manage markets, control user roles, and create markets from sports game data.

## Features

### Market Management

- **View Markets**: See all existing prediction markets, their questions, possible outcomes, end times, and current state.
- **Create Markets**: Manually create new prediction markets with custom questions, outcomes, and end times.
- **Resolve Markets**: Select the winning outcome for markets that have reached their end time.
- **Refresh Markets**: Update the list of markets to reflect the latest blockchain state.

### Role Management

- **Add/Remove Admins**: Grant or revoke administrative privileges to wallet addresses.
- **Add/Remove Resolvers**: Assign or remove resolver privileges for market resolution.

### Games Management

- **Fetch Sports Games**: Access games data for various leagues (Champions League, Premier League, NFL, NBA) by date.
- **Batch Create Markets**: Select multiple games and automatically create corresponding prediction markets.
- **Streamlined Workflow**: Replace manual scripting with a user-friendly interface for game-based market creation.

## How to Access

1. Navigate to `/admin` in your browser.
2. Connect your wallet using the "Connect Wallet" button.
3. The system will verify if your wallet has admin privileges.
4. If authorized, you will see the full dashboard. If not, you'll see an "Access Denied" message.
5. Use the "Disconnect Wallet" button if you need to switch to a different wallet.

## Usage Guide

### Creating a Market Manually

1. Navigate to the "Markets" tab.
2. Click "Create Market".
3. Enter the market question (e.g., "Will ETH reach $5000 by end of year?").
4. Add or modify outcomes (default is "Yes" and "No").
5. Set the end time for the market.
6. Click "Create Market" to submit the transaction.

### Creating Markets from Games

1. Navigate to the "Games Management" tab.
2. Select a date and league from the dropdown.
3. Click "Fetch Games" to retrieve available games.
4. Select the checkboxes for the games you want to create markets for.
5. Click "Create Markets" to create prediction markets for all selected games.

### Managing Roles

1. Navigate to the "Role Management" tab.
2. Enter a wallet address in the input field.
3. Click the appropriate button to add or remove that address as an admin or resolver.

### Resolving Markets

1. In the "Markets" tab, find a market that is open and ready for resolution.
2. Click the "Resolve" button next to that market.
3. Select the winning outcome from the dropdown.
4. Click "Confirm" to submit the resolution.

## Technical Implementation

The Admin Dashboard interfaces directly with the Metis L2 blockchain using:

- **Smart Contract Integration**: Direct calls to the vMarket prediction market contract.
- **File-Based Game Data**: Reads sports game data from the application's file system.
- **Web3 Authentication**: Secure wallet-based authentication for admin functions.

## Security

- All administrative functions require wallet connection and verification of admin role.
- Sensitive operations (creating/resolving markets, role management) require blockchain transactions to be signed with the admin's wallet.
- Only authorized wallet addresses can access admin features. 