# Tipflow
### Tip any streamer. Instantly.

The first fan-to-streamer tipping platform where fans pay with just their email. No MetaMask. No seed phrase. No wallet setup. No platform cut beyond 1%. Tips settle as USDC on Arbitrum in under 10 seconds with a real-time OBS overlay alert.

[Live Demo](https://tipflow.xyz) · [GitHub](https://github.com/Shanks-btc/Tipflow) · [Arbitrum TX](https://arbiscan.io/tx/0x2893827ef2c8186c38e23c7699f34b5442a9f935df8a36faf56785c5926a4d6b)

---

## What Tipflow Does

40% of the global streaming audience cannot tip their favourite creators. PayPal is blocked in 60+ countries. Twitch Bits are unavailable in most of the world. Existing Web3 tipping tools require MetaMask, seed phrases and manual network switching. Most fans give up before sending anything.

Tipflow solves all three problems at once.

A fan in Manila, Lagos or São Paulo visits **tipflow.xyz/tip/nightowl**, enters their email, receives a 6-digit code, verifies it, and their tip settles as USDC on Arbitrum in under 10 seconds. The streamer sees the fan's name appear on their OBS stream overlay before the stream chat has even moved on.

Magic creates an embedded wallet invisibly from the fan's email. Particle Network Universal Accounts pool the fan's assets across supported chains and route the tip automatically. Arbitrum's 2-second finality is what makes the overlay alert fire in real time. No wallet. No bridge. No gas token. No friction.

---

## Live Demo Run — Proof of Life

Captured against a real funded wallet on Arbitrum Mainnet:

| Output | Value |
|--------|-------|
| Fan email | pkelvin856@gmail.com |
| Tip amount | $1 USDC |
| Source chain | BSC (USDT) |
| Destination | Arbitrum One |
| Settlement time | ~20 seconds |
| EIP-7702 delegation | Confirmed on Arbitrum |
| Transaction | 0x2893...a4d6b |
| Platform fee | $0.00 |
| Overlay alert | Fired via Socket.io WebSocket |

Independent verification — anyone can verify on Arbiscan:

```
https://arbiscan.io/tx/0x2893827ef2c8186c38e23c7699f34b5442a9f935df8a36faf56785c5926a4d6b
```

---

## Proven On-Chain

| Metric | Value | Verification |
|--------|-------|--------------|
| EIP-7702 delegation | Confirmed | Arbiscan |
| USDC transferred | $1 via Particle UA | Arbiscan |
| Source chain | BSC | Arbiscan |
| Destination | Arbitrum One | Arbiscan |
| Magic wallet | Embedded, email-only | Magic Dashboard |
| WebSocket alert | Real-time, confirmed | Live test |

---

## Fee Comparison

| Platform | Fee | You keep per $10 | Speed |
|----------|-----|-----------------|-------|
| **Tipflow** | **1%** | **$9.90** | **~8 seconds** |
| Twitch Bits | Up to 50% | $5.00 | 45–60 days |
| PayPal | 3.5–5% | $9.50–$9.65 | 3–5 days |
| StreamElements | Variable | Variable | Variable |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Fan                                  │
│              (Any device, any country, email only)          │
└────────────────────────┬────────────────────────────────────┘
                         │ Enters email
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Magic SDK                                 │
│         Email OTP → Embedded Wallet (EOA)                   │
│         No MetaMask. No seed phrase. No extension.          │
└────────────────────────┬────────────────────────────────────┘
                         │ sign7702Authorization()
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           Particle Network Universal Accounts                │
│                   EIP-7702 mode                             │
│    Fan EOA → Universal Account on Arbitrum                  │
│    createTransferTransaction() routes from any chain        │
│    Fan never chooses network or token                       │
└────────────────────────┬────────────────────────────────────┘
                         │ USDC delivered
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Arbitrum One                               │
│              ChainID: 42161                                 │
│    2-second finality → streamer receives USDC               │
│    Alchemy Notify detects transfer event                    │
└────────────────────────┬────────────────────────────────────┘
                         │ Webhook fires
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Tipflow WebSocket Server                        │
│                  (Railway — Node.js)                        │
│    Alchemy Notify → POST /webhook                           │
│    Looks up streamer by UA address                          │
│    Emits tip_received to overlay:username room              │
└────────────────────────┬────────────────────────────────────┘
                         │ Socket.io event
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              OBS Overlay Browser Source                      │
│         tipflow.xyz/overlay/[username]                      │
│    Transparent background — invisible when idle             │
│    AlertCard animates in from right with fan name           │
│    Auto-dismisses after 5 seconds                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Infrastructure Used

### 1. Magic SDK
Magic creates an embedded wallet from the fan's email address invisibly. No browser extension. No seed phrase. No prior crypto knowledge required. The fan never sees a wallet address.

Magic's `sign7702Authorization()` signs the EIP-7702 delegation that turns the fan's Magic EOA into a Universal Account on Arbitrum. This is the bridge between Magic's embedded wallet layer and Particle Network's chain abstraction layer.

**Why it matters:** Without Magic, fans need MetaMask. With Magic, any email address in the world is a wallet.

### 2. Particle Network Universal Accounts (EIP-7702)
Particle's Universal Account SDK v1.1.1 is used in EIP-7702 mode. The fan's Magic EOA is delegated into a Universal Account that can source funds from any supported chain automatically. The fan never chooses a network, never bridges, never acquires a gas token.

`createTransferTransaction()` handles the entire cross-chain routing. The creator always receives USDC on Arbitrum regardless of what chain or token the fan holds.

**Why it matters:** Without Particle UA, fans need to bridge funds manually. With Particle UA, their balance on any supported chain becomes spendable instantly.

### 3. Arbitrum One
All tips settle as USDC on Arbitrum One (ChainID: 42161). Arbitrum's 2-second finality is not just infrastructure — it is the core product feature. It is what makes the OBS overlay alert fire while the fan is still watching the stream. A 14-day platform hold makes overlay alerts pointless. A 2-second Arbitrum settlement makes them magical.

**Why it matters:** Without Arbitrum's speed, the overlay alert fires after the stream ends. With Arbitrum, it fires before the stream chat moves on.

### 4. Alchemy Notify
Alchemy Notify monitors the streamer's UA address on Arbitrum for incoming USDC transfers. When a tip confirms, Alchemy fires a webhook to the Tipflow WebSocket server which emits the `tip_received` event to the streamer's overlay room via Socket.io.

---

## How Infrastructure Supports The Product

| Component | Role in Tipflow | Without It |
|-----------|----------------|------------|
| Magic | Email → embedded wallet | Fans need MetaMask |
| Particle UA + EIP-7702 | Cross-chain routing | Fans need to bridge |
| Arbitrum | Fast, cheap settlement | Overlay fires too late |
| Alchemy Notify | On-chain tip detection | No real-time alerts |
| Socket.io | WebSocket relay to OBS | No overlay animation |

The core thesis: Remove any one of these components and Tipflow stops working. Each is essential, not optional.

---

## Hackathon Tracks

**Universal Accounts Track — Particle Network**
- Particle UA SDK v1.1.1 in EIP-7702 mode
- Magic EOA delegated to Universal Account on Arbitrum
- Cross-chain USDC transfer confirmed on Arbitrum Mainnet
- TX: `0x2893827ef2c8186c38e23c7699f34b5442a9f935df8a36faf56785c5926a4d6b`

**Arbitrum Road to Open House London Bounty**
- App deployed on Arbitrum One
- User never sees chain, gas, wallet or bridge
- Email-only onboarding, USDC settlement, real-time alerts

**Magic Labs Bonus Challenge**
- Magic SDK embedded wallet powers all authentication
- Email OTP, invisible wallet creation, EIP-7702 signing
- Consumer-grade UX with no wallet language visible

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router (TypeScript) |
| Auth / Wallet | Magic SDK + @magic-ext/evm |
| Chain Abstraction | @particle-network/universal-account-sdk@1.1.1 |
| Blockchain | Arbitrum One (ChainID: 42161) |
| Real-time | Socket.io (WebSocket server) |
| Webhooks | Alchemy Notify |
| Database | Supabase (PostgreSQL) |
| Email | Resend API |
| Ethereum lib | ethers.js v6 |
| Deployment | Railway (Next.js + WebSocket server) |

---

## Local Deployment

### Prerequisites
- Node.js 22+
- Git
- Supabase account
- Particle Network account
- Magic account
- Alchemy account (Arbitrum Mainnet)
- Resend account

### 1. Clone Repository

```bash
git clone https://github.com/Shanks-btc/Tipflow.git
cd Tipflow
```

### 2. Install Dependencies

```bash
npm install
cd websocket-server && npm install && cd ..
```

### 3. Environment Setup

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

```bash
# Magic
NEXT_PUBLIC_MAGIC_API_KEY=pk_live_...
MAGIC_SECRET_KEY=sk_live_...

# Particle Network
NEXT_PUBLIC_PARTICLE_PROJECT_ID=
NEXT_PUBLIC_PARTICLE_CLIENT_KEY=
NEXT_PUBLIC_PARTICLE_APP_ID=

# Alchemy (Arbitrum Mainnet)
NEXT_PUBLIC_ALCHEMY_API_KEY=
ALCHEMY_WEBHOOK_AUTH_TOKEN=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3001
WALLET_DERIVATION_SECRET=
```

### 4. Database Setup

Run in Supabase SQL Editor:

```sql
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
  streamer_id     UUID REFERENCES streamers(id),
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

CREATE TABLE otp_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  code        TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE streamers DISABLE ROW LEVEL SECURITY;
ALTER TABLE tips DISABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes DISABLE ROW LEVEL SECURITY;
```

### 5. Start Both Servers

Terminal 1:
```bash
npm run dev
# Next.js on http://localhost:3000
```

Terminal 2:
```bash
cd websocket-server
npm start
# WebSocket server on http://localhost:3001
```

---

## Test Account for Judges

Use this streamer account to experience the full product:

```
Tip page:    https://tipflow.xyz/tip/nightowl
Overlay URL: https://tipflow.xyz/overlay/nightowl
UA Address:  0x9Fe8f5497180976FceFee773Dd5778dB73E01047
```

Steps to test the full fan flow:
1. Open `tipflow.xyz/tip/nightowl` on any device
2. Select a tip amount ($1 minimum)
3. Enter your email address
4. Enter the 6-digit code from your inbox
5. Watch the tip confirm and settle on Arbitrum
6. Open `tipflow.xyz/overlay/nightowl` on a second screen to see the real-time alert fire

To test the streamer dashboard:
1. Go to `tipflow.xyz/login`
2. Enter your email
3. Verify OTP
4. New users go to `/setup` to pick a username
5. Returning users go to `/dashboard` directly

---

## Fan Tip Flow — Technical Walkthrough

### Step 1 — Fan enters email

```typescript
// src/app/api/auth/send-otp/route.ts
const code = Math.floor(100000 + Math.random() * 900000).toString()
await supabase.from('otp_codes').insert({ email, code, expires_at })
await resend.emails.send({
  from: 'Tipflow <noreply@tipflow.xyz>',
  to: email,
  subject: 'Your Tipflow login code',
  html: `<h1>${code}</h1>`
})
```

### Step 2 — Magic wallet created invisibly

```typescript
// src/lib/magic.ts
const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY!, {
  extensions: [
    new EVMExtension({
      rpcUrl: ARBITRUM_RPC,
      chainId: 42161,
    })
  ]
})
```

### Step 3 — EIP-7702 delegation + Particle UA

```typescript
// src/hooks/useParticleUA.ts
const ua = new UniversalAccount({
  projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
  clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
  appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
  ownerAddress: magicEOA,
})

const tx = await ua.createTransferTransaction({
  to: streamerUAAddress,
  value: amountUsd.toString(),
  token: 'USDC',
  chainId: 42161,
})
const receipt = await signer.sendTransaction(tx)
```

### Step 4 — Overlay fires in real time

```typescript
// websocket-server/index.ts
app.post('/webhook', async (req, res) => {
  const { activity } = req.body
  for (const event of activity) {
    if (event.asset !== 'USDC') continue
    const streamer = await supabase
      .from('streamers')
      .select('username')
      .eq('ua_address', event.toAddress)
      .single()
    io.to(`overlay:${streamer.username}`).emit('tip_received', {
      fanName: tip.fan_email.split('@')[0],
      amount: tip.amount_usd,
      message: tip.message,
    })
  }
})
```

---

## Project Structure

```
tipflow/
├── docs/
│   ├── architecture.md
│   ├── plan.md
│   ├── deploy.md
│   └── handoff.md
├── src/
│   ├── app/
│   │   ├── page.tsx                    ← Landing page
│   │   ├── tip/[username]/page.tsx     ← Fan tip page
│   │   ├── overlay/[username]/page.tsx ← OBS browser source
│   │   ├── login/page.tsx              ← Email OTP auth
│   │   ├── dashboard/page.tsx          ← Streamer dashboard
│   │   ├── setup/page.tsx              ← Onboarding wizard
│   │   └── api/
│   │       ├── auth/send-otp/          ← OTP via Resend
│   │       ├── auth/verify-otp/        ← OTP verification
│   │       ├── auth/logout/            ← Session clear
│   │       ├── tips/                   ← Tip recording
│   │       ├── streamers/              ← Streamer profiles
│   │       └── webhooks/alchemy/       ← Alchemy Notify
│   ├── components/
│   │   ├── fan/                        ← Fan tip flow
│   │   ├── dashboard/                  ← Streamer dashboard
│   │   ├── overlay/                    ← OBS alert card
│   │   ├── landing/                    ← Marketing page
│   │   └── shared/                     ← Reusable components
│   ├── hooks/
│   │   ├── useParticleUA.ts            ← Particle UA + EIP-7702
│   │   ├── useMagicAuth.ts             ← Magic SDK auth
│   │   └── useTipFlow.ts               ← Fan flow state machine
│   └── lib/
│       ├── magic.ts                    ← Magic SDK init
│       ├── particle.ts                 ← Particle UA init
│       ├── supabase.ts                 ← Supabase client
│       ├── tipSigner.ts                ← Signer abstraction
│       └── walletDerivation.ts         ← Deterministic wallets
├── websocket-server/
│   └── index.ts                        ← Socket.io + webhooks
└── supabase/
    └── migrations/                     ← DB schema
```

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Landing | tipflow.xyz | Marketing page with problem, solution, pricing |
| Fan tip | tipflow.xyz/tip/[username] | Mobile-first tip flow |
| OBS Overlay | tipflow.xyz/overlay/[username] | Transparent browser source |
| Login | tipflow.xyz/login | Email OTP authentication |
| Setup | tipflow.xyz/setup | First-time streamer onboarding |
| Dashboard | tipflow.xyz/dashboard | Earnings, tips, settings |

---

## Live Links

| Resource | URL |
|----------|-----|
| Live app | https://tipflow.xyz |
| GitHub | https://github.com/Shanks-btc/Tipflow |
| Demo tip page | https://tipflow.xyz/tip/nightowl |
| Proven TX | https://arbiscan.io/tx/0x2893827ef2c8186c38e23c7699f34b5442a9f935df8a36faf56785c5926a4d6b |

---

## Team

Solo founder — Full-stack Web3 developer with experience in Next.js, Node.js, EVM chains, account abstraction and real-time systems. Built Tipflow end-to-end for the UXmaxx by Encode Club hackathon 2026.

| Channel | Handle |
|---------|--------|
| X | @Shank_btc |
| GitHub | Shanks-btc |
| Email | pkelvin856@gmail.com |
