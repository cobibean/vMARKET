# vMARKET Rebuild Plan

## Overview

This document outlines the plan for rebuilding vMARKET from its current implementation into a modern, unified prediction markets platform as described in the PRD. The plan incorporates insights from the existing codebase while adopting new technologies and architectural patterns.

## Current State Analysis

vMARKET currently operates as a blockchain-based prediction market platform with:
- Dual "room" system (USDC and VESTA tokens)
- Next.js frontend with Tailwind CSS
- Ethers.js and ThirdWeb integration for blockchain interactions
- Market categories (active, pending, resolved)
- Complex data flow between frontend, smart contracts, and external APIs

## Rebuild Goals

The rebuild aims to:
1. Unify the room system into a single market structure
2. Modernize the UI with React Aria, Tailwind, and Framer Motion
3. Add real-time price charts for market outcomes
4. Enable user profiles and comments via Supabase
5. Implement Zustand for state management
6. Consolidate duplicate components and scripts
7. Improve overall UX with floating action buttons and streamlined navigation

## Frontend Implementation Plan

### 1. Project Setup & Structure (Day 1)

- Initialize new Next.js project with App Router
- Configure Tailwind CSS with the same design tokens
- Set up Zustand for state management
- Create folder structure according to PRD
- Install dependencies (React Aria, Framer Motion, Ethers.js, etc.)

### 2. Theme & Design System (Day 1-2)

- Create `styles/theme.ts` with design tokens extracted from current implementation
- Set up color scheme with light/dark mode support
- Implement spacing, typography, and radius scales
- Configure Tailwind to use these design tokens
- Create a theme context provider

### 3. Core Component Library (Day 2-3)

- Migrate and refactor shared components:
  - Button variants (primary, secondary, ghost)
  - Cards (base card, info card)
  - Dialog/Modal components
  - Form elements (inputs, selects)
  - Layout components (containers, grid)
  - Loading/skeleton states
- Enhance with React Aria for accessibility
- Add Framer Motion animations

### 4. State Management (Day 3-4)

- Implement Zustand stores:
  - `useUserStore`: User wallet, balance, holdings
  - `useMarketStore`: Markets data, fetching logic
  - `useUIStore`: UI state (open modals, current tab, theme)
- Add persistence where appropriate
- Create custom hooks for common data operations

### 5. Market Components (Day 4-5)

- Create `MarketCard` component with:
  - Clean, unified design 
  - Support for all market states
  - Price visualization
  - Action buttons
- Create `MarketModal` with:
  - Detailed market information
  - Buy interface
  - Charts section
  - Comments section (placeholder)
- Implement polling mechanism for real-time updates

### 6. Chart Implementation (Day 5-6)

- Research and select appropriate charting library
- Create chart components for market price visualization
- Implement data transformation utilities
- Set up polling mechanism for real-time updates
- Create zoom and time range controls

### 7. Page Implementation (Day 6-7)

- Build main pages:
  - Landing page with featured markets
  - Open markets tab with filterable list
  - Closed markets tab with resolved markets
  - User profile page
- Implement navigation between pages
- Add responsive design for all viewport sizes

### 8. Floating Action Buttons (Day 7)

- Design and implement floating action button component
- Add context-aware actions (create market, claim all, filters)
- Implement animations for button interactions

### 9. Blockchain Integration (Day 8)

- Set up Ethers.js and ThirdWeb SDK
- Implement wallet connection
- Create adapters for smart contract interactions
- Add transaction handling and error management

### 10. Supabase Integration (Day 8-9)

- Set up Supabase client
- Implement authentication with wallet
- Create database schema for comments and profiles
- Implement API functions for data access

### 11. Testing & Refinement (Day 9-10)

- Test all components and pages
- Optimize performance
- Fix bugs and edge cases
- Add loading states and error handling
- Ensure responsive design works on all devices

## Initial Frontend Roadmap (30-minute Sprint)

For the initial 30-minute development sprint, we'll focus on:

1. **Project Setup**: 
   - Initialize Next.js with App Router
   - Configure Tailwind CSS
   - Set up folder structure

2. **Design Token Extraction**:
   - Create `styles/theme.ts` with core design tokens from current implementation
   - Set up color schemes for light/dark mode

3. **Component Foundation**:
   - Create basic Button component
   - Set up Card component shell

4. **Layout Structure**:
   - Implement basic page layout
   - Create header and tabs navigation

This initial sprint will establish the foundation for the rebuild, focusing on the core UI elements that will be used throughout the application.

## Technical Decisions

### State Management
We'll use Zustand over other options because it's lightweight, has a simple API, and works well with React hooks, making it ideal for managing the complex state of prediction markets.

### Styling Approach
We'll maintain Tailwind CSS but enhance it with:
- Consistent design tokens
- Component composition patterns
- CSS variables for dynamic theming

### Data Fetching Strategy
For market data, we'll implement:
- Initial SSR fetch for SEO and performance
- Client-side polling for real-time updates
- Optimistic UI updates for transactions

### Smart Contract Integration
We'll simplify the current approach by:
- Creating a unified contract interface
- Implementing retry and fallback mechanisms
- Adding transaction queue management 