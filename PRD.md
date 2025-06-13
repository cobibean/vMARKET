Perfect — thanks for the full tree. You’ve got a solid foundation but there’s definitely room for consolidation, cleanup, and modernization.

Here’s the plan:

⸻

🗂️ Suggested Folder Structure for the vMARKET Rebuild

src/
├── app/                      # Next.js routes
│   ├── page.tsx              # Homepage (Landing or Markets)
│   ├── open/page.tsx         # Open markets tab
│   ├── closed/page.tsx       # Closed markets tab
│   └── user/page.tsx         # Profile page
├── components/
│   ├── charts/               # Real-time price charts
│   ├── layout/               # Header, Footer, Tabs
│   ├── market/               # MarketCard, MarketModal, MarketBuyInterface
│   ├── modals/               # Modal wrappers, InfoModal, CreateMarketModal
│   └── shared/               # Buttons, Cards, Avatars, Skeletons
├── constants/                # ABIs, contract addresses, outcome enums
├── context/                  # ThemeContext, maybe fallback UI context
├── hooks/                    # useMarketData, usePolling, useUser, etc.
├── lib/                      # API, utils, Supabase client
├── state/                    # Zustand stores
│   ├── useUserStore.ts
│   ├── useMarketStore.ts
│   └── useUIStore.ts
├── styles/
│   ├── globals.css
│   └── theme.ts              # Design tokens (spacing, colors, etc.)
├── types/                    # Market, UserProfile, etc.
├── utils/                    # General helpers
└── backend/                  # Scripts (batch create, resolve, fetch, etc.)



⸻

🧾 vMARKET Rebuild — PRD (Product Requirements Document)

1. Project Overview

Rebuild vMARKET into a sleek, modern prediction market DApp with a unified experience, live market pricing charts, off-chain comments, and streamlined navigation.

⸻

2. Goals
	•	Modernize UI (React Aria + Tailwind + Framer Motion)
	•	Switch to a single-room market structure (no VESTA/USDC split)
	•	Add live-updating price charts for each market outcome
	•	Consolidate duplicated components and backend scripts
	•	Enable user profiles + comment threads stored off-chain
	•	Use Zustand for state management across views

⸻

3. Core Features

Feature	Description
💹 Real-Time Price Charts	Line chart with 1–3 colored outcomes, polled every 30s (adjustable)
📂 Unified Market View	“Open” and “Closed” tabs replace split dashboards
🧠 Predictive Modal	Clicking a market opens a detailed modal with buy interface, info, and comments
🗣 Comments	Supabase backend for off-chain threaded comments (wallet required)
👤 User Profile Page	Shows wallet address, optional avatar + name, and user’s market history
➕ Floating Action Buttons	For market creation, filtering, and “Claim All”
🎨 Design Tokens	theme.ts for unified color, spacing, radius, etc.
⚙️ Zustand Stores	useUserStore, useMarketStore, useUIStore
🔄 Scripts Refactor	Backend market creation/resolution scripts consolidated into backend/ folder



⸻

4. Tech Stack
	•	Frontend: Next.js (App Router), Tailwind CSS, React Aria, Framer Motion
	•	State: Zustand
	•	Backend: Node.js scripts + Supabase (auth, profiles, comments)
	•	Web3: Ethers.js + Thirdweb SDK + Metis chain

⸻

5. MVP Roadmap
	1.	Design tokens + theme file
	2.	Consolidate and refactor reusable components
	3.	Implement Zustand stores
	4.	Build Open/Closed tab routing
	5.	Create MarketCard + Modal flow with polling charts
	6.	Integrate Supabase (user + comments)
	7.	Floating action buttons
	8.	User profile page
	9.	Backend script cleanup (create, resolve)

⸻
