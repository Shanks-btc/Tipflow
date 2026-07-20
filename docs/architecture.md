# Tipflow — Architecture Document
## Single source of truth. Do not deviate from this.

---

## Product Overview

**Name:** Tipflow
**Tagline:** Tip any streamer. Instantly.
**Domain:** tipflow.app
**What it does:** Fans tip live streamers from anywhere in the world
using only their email. No wallet. No MetaMask. No gas fees.
Tips arrive in 8 seconds via Arbitrum.

**Hackathon:** UXmaxx by Encode Club
**Target prizes:**
- Universal Accounts Track (Particle): $2,500
- Arbitrum "Road to Open House London" Bounty: $2,000
- Magic Labs Bonus Challenge: $500
- **Maximum extractable: $5,000**

**Prize requirements:**
- UA Track: Must use Universal Accounts SDK in EIP-7702 mode +
  at least one cross-chain op + functional deployed demo
- Arbitrum: App deployed on Arbitrum, user never sees chain/gas/wallet
- Magic: Magic embedded wallet is the entire auth and signing layer

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 14 (App Router) | Full-stack, SSR, API routes |
| Language | TypeScript | Latest | Type safety throughout |
| Styling | Tailwind CSS | 3.x | Utility classes |
| Auth/Wallet | Magic SDK | Latest | Email OTP embedded wallet |
| EVM Extension | @magic-ext/evm | Latest | EIP-7702 signing on Magic EOA |
| Chain Abstraction | @particle-network/universal-account-sdk | **1.1.1 PINNED** | Universal Accounts, cross-chain |
| Blockchain | Arbitrum One | Chain ID: 42161 | Execution + settlement |
| Real-time | Socket.io | Latest | OBS overlay WebSocket events |
| Webhooks | Alchemy Notify | - | Detect USDC transfers on Arbitrum |
| Database | Supabase | Latest | PostgreSQL, auth helpers |
| Ethereum lib | ethers | **6.x** | Signature serialization |
| Deployment | Vercel + Render | - | Next.js + WebSocket server |

### CRITICAL SDK NOTE
`@particle-network/universal-account-sdk` MUST be pinned to `1.1.1`.
Particle is actively migrating to V2. Do not run `npm update`.
Lock in package.json: `"@particle-network/universal-account-sdk": "1.1.1"`

---

## Folder Structure

```
tipflow/
├── .env.local                          # Never commit
├── .env.example                        # Commit with empty values
├── .gitignore
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
│
├── docs/                               # This documentation
│   ├── architecture.md
│   ├── plan.md
│   ├── deploy.md
│   └── handoff.md
│
├── public/
│   ├── favicon.ico
│   └── og-image.png
│
├── src/
│   ├── app/                            # Next.js 14 App Router
│   │   ├── layout.tsx                  # Root layout, Inter font, dark bg
│   │   ├── page.tsx                    # Landing page
│   │   ├── globals.css                 # CSS variables + keyframes
│   │   │
│   │   ├── tip/
│   │   │   └── [username]/
│   │   │       └── page.tsx            # Fan tip page (PUBLIC)
│   │   │
│   │   ├── overlay/
│   │   │   └── [username]/
│   │   │       └── page.tsx            # OBS browser source (PUBLIC)
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx                # Magic email OTP login
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Streamer earnings hub (PROTECTED)
│   │   │
│   │   ├── setup/
│   │   │   └── page.tsx                # First-time onboarding (PROTECTED)
│   │   │
│   │   ├── settings/
│   │   │   └── page.tsx                # Account settings (PROTECTED)
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts      # POST: Magic token verify + session
│   │       │   └── session/route.ts    # GET: current session
│   │       │
│   │       ├── tips/
│   │       │   ├── route.ts            # POST: record tip in DB
│   │       │   └── [streamerId]/
│   │       │       └── route.ts        # GET: tip history for streamer
│   │       │
│   │       ├── balance/
│   │       │   └── [address]/
│   │       │       └── route.ts        # GET: UA primary assets balance
│   │       │
│   │       ├── streamers/
│   │       │   └── [username]/
│   │       │       └── route.ts        # GET: streamer public profile
│   │       │
│   │       ├── withdraw/
│   │       │   └── route.ts            # POST: initiate withdrawal from UA
│   │       │
│   │       └── webhooks/
│   │           └── alchemy/
│   │               └── route.ts        # POST: Alchemy Notify receiver
│   │
│   ├── components/
│   │   ├── ui/                         # Base design system components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── fan/                        # Fan tip page components
│   │   │   ├── TipCard.tsx             # Main container, state machine
│   │   │   ├── StreamerCard.tsx        # Streamer avatar + live dot
│   │   │   ├── AmountSelector.tsx      # 4 preset + custom input
│   │   │   ├── EmailModal.tsx          # Email entry step
│   │   │   ├── OTPModal.tsx            # 6-digit OTP entry
│   │   │   ├── SendingState.tsx        # Spinner + chain route pill
│   │   │   └── SuccessState.tsx        # Checkmark + receipt
│   │   │
│   │   ├── dashboard/                  # Streamer dashboard components
│   │   │   ├── BalanceCard.tsx         # USDC balance + withdraw
│   │   │   ├── TipLinkCard.tsx         # tipflow.app/tip/username + copy
│   │   │   ├── OverlayCard.tsx         # Overlay URL + test alert
│   │   │   ├── TipFeed.tsx             # Recent tips list
│   │   │   ├── StatCard.tsx            # Reusable stat metric card
│   │   │   └── WithdrawModal.tsx       # Withdrawal flow modal
│   │   │
│   │   ├── overlay/
│   │   │   └── AlertCard.tsx           # OBS overlay tip alert
│   │   │
│   │   ├── landing/                    # Landing page sections
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   └── CTABand.tsx
│   │   │
│   │   └── shared/                     # Reused across pages
│   │       ├── LiveDot.tsx             # Green pulsing live indicator
│   │       └── ChainRoute.tsx          # BSC → Particle UA → Arbitrum pill
│   │
│   ├── lib/                            # Core utilities and SDK inits
│   │   ├── magic.ts                    # Magic SDK browser client
│   │   ├── magic-server.ts             # Magic Admin SDK (server-side verify)
│   │   ├── particle.ts                 # Particle UA SDK init
│   │   ├── alchemy.ts                  # Alchemy SDK client
│   │   ├── supabase.ts                 # Supabase browser client
│   │   ├── supabase-server.ts          # Supabase server client (cookies)
│   │   └── constants.ts               # All constants in one place
│   │
│   ├── hooks/                          # React custom hooks
│   │   ├── useParticleUA.ts            # UA account creation + transactions
│   │   ├── useMagicAuth.ts             # Magic login, logout, session
│   │   ├── useTipFlow.ts               # Fan tip state machine
│   │   ├── useBalance.ts               # Fetch UA primary assets
│   │   └── useOverlaySocket.ts         # WebSocket connection for overlay
│   │
│   ├── types/                          # TypeScript types
│   │   ├── tip.ts
│   │   └── streamer.ts
│   │
│   └── middleware.ts                   # Protect /dashboard, /setup, /settings
│
├── websocket-server/                   # Separate deployment on Render
│   ├── package.json
│   ├── index.ts                        # Express + Socket.io + webhook handler
│   └── tsconfig.json
│
└── supabase/
    └── migrations/
        └── 001_initial.sql             # Full schema
```

---

## Database Schema

```sql
-- supabase/migrations/001_initial.sql

CREATE TABLE streamers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username        TEXT UNIQUE NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  magic_address   TEXT,
  ua_address      TEXT,
  display_name    TEXT,
  avatar_url      TEXT,
  alert_duration  INTEGER DEFAULT 5,
  min_tip_amount  NUMERIC(10,2) DEFAULT 1.00,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tips (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_id     UUID REFERENCES streamers(id) ON DELETE CASCADE,
  fan_email       TEXT,
  fan_address     TEXT,
  amount_usd      NUMERIC(10,2) NOT NULL,
  message         TEXT,
  tx_hash         TEXT UNIQUE,
  source_chain    TEXT,
  status          TEXT DEFAULT 'pending',
  confirmed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tips_streamer_id ON tips(streamer_id);
CREATE INDEX idx_tips_status ON tips(status);
CREATE INDEX idx_tips_tx_hash ON tips(tx_hash);
CREATE INDEX idx_tips_created_at ON tips(created_at DESC);
```

---

## Constants (src/lib/constants.ts)

```typescript
export const APP_NAME = 'Tipflow'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL!
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL!

// Arbitrum One
export const ARBITRUM_CHAIN_ID = 42161
export const ARBITRUM_RPC = `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`

// Token addresses on Arbitrum One
export const USDC_ARBITRUM = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
export const USDT_ARBITRUM = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'

// Particle UA supported source chains for demo
export const SOURCE_CHAINS = {
  BSC: 56,
  BASE: 8453,
  ETHEREUM: 1,
  ARBITRUM: 42161,
}

// Tip amounts
export const PRESET_AMOUNTS = [1, 3, 5, 10]
export const MIN_TIP = 1
export const MAX_TIP = 500
export const PLATFORM_FEE_PERCENT = 0.01 // 1%
```

---

## Core Flows

### Flow 1: Fan Tips a Streamer

```
1. Fan visits tipflow.app/tip/nightowl
2. Sees streamer card + amount selector
3. Clicks "Send $5"
4. Types email → Magic sends OTP
5. Enters OTP → Magic verifies
6. Magic creates EOA (invisible to fan)
7. sign7702Authorization() → EIP-7702 delegation
8. Fan EOA becomes Universal Account on Arbitrum (SAME address)
9. createTransferTransaction():
   - Reads fan balance across ALL supported chains
   - Routes from wherever funds exist (e.g. BSC USDT)
   - Delivers USDC to streamer UA on Arbitrum
10. Transaction confirmed on Arbitrum (~2-4 seconds)
11. Fan sees success screen + receipt
12. Alchemy Notify detects USDC transfer to streamer address
13. Fires POST to websocket-server/webhook
14. WebSocket emits "tip_received" to streamer's room
15. Overlay page receives event → AlertCard animates in
16. Streamer sees fan name on stream in ~8 seconds total
```

### Flow 2: Streamer Onboarding

```
1. Visits tipflow.app → "Get tip link"
2. /login → Magic email OTP
3. First time: redirected to /setup
4. Picks username → stored in Supabase
5. Magic creates their EOA
6. EIP-7702 → UA on Arbitrum (their receiving address)
7. Gets tip link: tipflow.app/tip/[username]
8. Gets overlay URL: tipflow.app/overlay/[username]
9. Pastes overlay URL into OBS as Browser Source (1920×1080)
10. Redirected to /dashboard
```

### Flow 3: Withdrawal

```
1. Streamer hits "Withdraw" on dashboard
2. Enters destination (defaults to their own address)
3. createTransferTransaction() from their UA → destination
4. USDC leaves Arbitrum UA
5. Dashboard balance updates
```

---

## WebSocket Server Architecture

```typescript
// websocket-server/index.ts
// Deployed separately on Render (NOT on Vercel)
// Vercel is serverless — cannot hold persistent WebSocket connections

Express server: port 3001
Endpoints:
  POST /webhook — Alchemy Notify
    - Validates x-alchemy-signature header
    - Parses activity[] from body
    - For each USDC transfer to a known streamer address:
      - Looks up streamer username from UA address
      - Emits "tip_received" to room `overlay:${username}`
      - Payload: { fanAddress, amount, message, txHash, timestamp }
  GET /health — uptime check

Socket.io:
  - Overlay page connects on mount
  - Joins room: socket.join(`overlay:${username}`)
  - Listens for "tip_received" event
  - Renders AlertCard on receipt
  - Disconnects on unmount
```

---

## Environment Variables

```bash
# .env.local — fill before running any code

# Magic
NEXT_PUBLIC_MAGIC_API_KEY=pk_live_...
MAGIC_SECRET_KEY=sk_live_...

# Particle Network
NEXT_PUBLIC_PARTICLE_PROJECT_ID=
NEXT_PUBLIC_PARTICLE_CLIENT_KEY=
NEXT_PUBLIC_PARTICLE_APP_ID=

# Alchemy (Arbitrum Mainnet)
NEXT_PUBLIC_ALCHEMY_API_KEY=
ALCHEMY_WEBHOOK_AUTH_TOKEN=    # Set this in Alchemy Notify dashboard too

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

---

## Reference Implementation

The official Particle Network demo implementing the exact same
Magic + EIP-7702 + Universal Accounts + Arbitrum stack:

**github.com/Particle-Network/ua-7702-magic-demo**

Clone this first. Understand how it works. Build Tipflow on top of it.
Do NOT build the Magic + EIP-7702 + UA wiring from scratch.