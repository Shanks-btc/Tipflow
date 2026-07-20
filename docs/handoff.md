# Tipflow — Claude Code Handoff
## Copy each phase prompt into Claude Code exactly as written.
## Complete Phase 1 fully before starting Phase 2. Never skip.

---

## How to Use This Document

1. Open Claude Code
2. Copy the CONTEXT BLOCK first (one time only at start of session)
3. Copy each Phase prompt one at a time
4. Verify the success criteria before moving to next phase
5. If Claude Code breaks something: paste the RECOVERY prompt

---

## CONTEXT BLOCK — Paste This Once at the Start of Every Session

```
You are building Tipflow — a full-stack Next.js 14 web application.

PRODUCT: Tipflow
TAGLINE: Tip any streamer. Instantly.
DOMAIN: tipflow.app
WHAT IT DOES: Fans tip live streamers using only their email.
No wallet. No MetaMask. No gas. No seed phrases.
Tips appear on OBS stream overlays within 8 seconds.

TECH STACK (do not deviate):
- Next.js 14 App Router + TypeScript
- Tailwind CSS
- magic-sdk + @magic-ext/evm (email OTP + EIP-7702 signing)
- @particle-network/universal-account-sdk@1.1.1 PINNED (Universal Accounts)
- Arbitrum One, Chain ID: 42161
- Socket.io (WebSocket overlay alerts)
- Alchemy Notify (on-chain tip detection)
- Supabase (PostgreSQL)
- ethers@6
- Vercel (app) + Render (WebSocket server)

DESIGN SYSTEM (exact hex values, never change):
Background:     #09090F
Surface 1:      #111118
Surface 2:      #18181F
Surface 3:      #1E1E2C
Primary:        #F97316 (orange)
Primary hover:  #FB923C
Primary dim:    rgba(249,115,22,0.11)
Primary border: rgba(249,115,22,0.25)
Gold:           #FBBF24
Teal:           #34D399
Text primary:   #F0EFE8
Text secondary: #7A7A8A
Text muted:     #444455
Border:         rgba(255,255,255,0.07)

CRITICAL RULES:
1. ZERO crypto terms on fan-facing pages (no chain names, no USDC, no wallet)
2. All fan amounts in USD only
3. @particle-network/universal-account-sdk MUST stay at 1.1.1 — NEVER update
4. Arbitrum Mainnet only — never testnet in production code
5. Every page must be responsive from 320px to 1536px
6. No horizontal overflow on any page except /overlay/[username]

Read the docs/ folder for full specifications before any task.
```

---

## PHASE 1 — Project Scaffold

```
PHASE 1: Scaffold Tipflow from scratch.

Read docs/architecture.md completely before starting.

Tasks in order:

1. INITIALISE PROJECT
   Run: npx create-next-app@latest tipflow --typescript --tailwind --app --no-src-dir
   Then move all files into src/ structure manually.
   Actually use: npx create-next-app@latest tipflow --typescript --tailwind --app --src-dir --import-alias "@/*"

2. TAILWIND CONFIG
   Replace tailwind.config.js content with:
   ```
   import type { Config } from 'tailwindcss'
   const config: Config = {
     content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
     theme: {
       extend: {
         screens: {
           'xs': '320px',
           'sm': '480px',
           'md': '768px',
           'lg': '1024px',
           'xl': '1280px',
           '2xl': '1536px',
         },
         colors: {
           orange: { DEFAULT: '#F97316', light: '#FB923C', dim: 'rgba(249,115,22,0.11)' },
           teal: { DEFAULT: '#34D399', dim: 'rgba(52,211,153,0.10)' },
           gold: { DEFAULT: '#FBBF24', dim: 'rgba(251,191,36,0.10)' },
           bg: { DEFAULT: '#09090F' },
           s1: { DEFAULT: '#111118' },
           s2: { DEFAULT: '#18181F' },
           s3: { DEFAULT: '#1E1E2C' },
         },
         fontFamily: {
           sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
         },
       },
     },
     plugins: [],
   }
   export default config
   ```

3. GLOBALS.CSS
   Replace src/app/globals.css with:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   :root {
     --bg: #09090F;
     --s1: #111118;
     --s2: #18181F;
     --s3: #1E1E2C;
     --or: #F97316;
     --orl: #FB923C;
     --ord: rgba(249,115,22,0.11);
     --orb: rgba(249,115,22,0.25);
     --gd: #FBBF24;
     --gdd: rgba(251,191,36,0.10);
     --gdb: rgba(251,191,36,0.22);
     --tl: #34D399;
     --tld: rgba(52,211,153,0.10);
     --tlb: rgba(52,211,153,0.22);
     --t: #F0EFE8;
     --ts: #7A7A8A;
     --tm: #444455;
     --b: rgba(255,255,255,0.07);
     --bs: rgba(255,255,255,0.13);
   }

   html, body {
     overflow-x: hidden;
     max-width: 100vw;
     background: #09090F;
     color: #F0EFE8;
   }

   *, *::before, *::after {
     box-sizing: border-box;
     min-width: 0;
   }

   p, span, h1, h2, h3, h4, h5, h6, label, a {
     overflow-wrap: break-word;
     word-break: break-word;
   }

   button, a { min-height: 44px; }

   input, textarea, select {
     background: var(--s1);
     border: 1.5px solid var(--b);
     border-radius: 10px;
     color: var(--t);
     padding: 13px 15px;
     font-size: 15px;
     outline: none;
     width: 100%;
     transition: border-color 0.15s;
   }

   input:focus, textarea:focus {
     border-color: var(--or);
   }

   input::placeholder, textarea::placeholder {
     color: var(--tm);
   }

   @keyframes blink {
     0%, 100% { opacity: 1; }
     50% { opacity: 0.25; }
   }

   @keyframes fadeUp {
     from { opacity: 0; transform: translateY(8px); }
     to { opacity: 1; transform: translateY(0); }
   }

   @keyframes spin {
     from { transform: rotate(0deg); }
     to { transform: rotate(360deg); }
   }

   @keyframes shrink {
     from { width: 100%; }
     to { width: 0%; }
   }

   @keyframes alertIn {
     from { transform: translateX(120%); opacity: 0; }
     to { transform: translateX(0); opacity: 1; }
   }
   ```

4. INSTALL DEPENDENCIES
   ```bash
   npm install magic-sdk @magic-ext/evm
   npm install @particle-network/universal-account-sdk@1.1.1
   npm install @supabase/supabase-js @supabase/ssr
   npm install socket.io-client
   npm install ethers@6
   ```
   Lock the particle SDK: in package.json change
   "@particle-network/universal-account-sdk": "^1.1.1"
   to
   "@particle-network/universal-account-sdk": "1.1.1"

5. CREATE FOLDER STRUCTURE
   Create these empty files (just export default function Page() { return null }):
   src/app/tip/[username]/page.tsx
   src/app/overlay/[username]/page.tsx
   src/app/login/page.tsx
   src/app/dashboard/page.tsx
   src/app/setup/page.tsx
   src/app/settings/page.tsx
   src/app/api/auth/login/route.ts
   src/app/api/auth/session/route.ts
   src/app/api/tips/route.ts
   src/app/api/tips/[streamerId]/route.ts
   src/app/api/balance/[address]/route.ts
   src/app/api/streamers/[username]/route.ts
   src/app/api/withdraw/route.ts
   src/app/api/webhooks/alchemy/route.ts
   src/components/ui/Button.tsx
   src/components/ui/Input.tsx
   src/components/ui/Card.tsx
   src/components/ui/Modal.tsx
   src/components/fan/TipCard.tsx
   src/components/fan/StreamerCard.tsx
   src/components/fan/AmountSelector.tsx
   src/components/fan/EmailModal.tsx
   src/components/fan/OTPModal.tsx
   src/components/fan/SendingState.tsx
   src/components/fan/SuccessState.tsx
   src/components/dashboard/BalanceCard.tsx
   src/components/dashboard/TipLinkCard.tsx
   src/components/dashboard/OverlayCard.tsx
   src/components/dashboard/TipFeed.tsx
   src/components/dashboard/StatCard.tsx
   src/components/dashboard/WithdrawModal.tsx
   src/components/overlay/AlertCard.tsx
   src/components/landing/Navbar.tsx
   src/components/landing/Hero.tsx
   src/components/landing/StatsBar.tsx
   src/components/landing/Features.tsx
   src/components/landing/HowItWorks.tsx
   src/components/landing/CTABand.tsx
   src/components/shared/LiveDot.tsx
   src/components/shared/ChainRoute.tsx
   src/hooks/useParticleUA.ts
   src/hooks/useMagicAuth.ts
   src/hooks/useTipFlow.ts
   src/hooks/useBalance.ts
   src/hooks/useOverlaySocket.ts
   src/lib/magic.ts
   src/lib/magic-server.ts
   src/lib/particle.ts
   src/lib/alchemy.ts
   src/lib/supabase.ts
   src/lib/supabase-server.ts
   src/lib/constants.ts
   src/types/tip.ts
   src/types/streamer.ts
   src/middleware.ts

6. CREATE SRC/LIB/CONSTANTS.TS
   ```typescript
   export const APP_NAME = 'Tipflow'
   export const APP_URL = process.env.NEXT_PUBLIC_APP_URL!
   export const WS_URL = process.env.NEXT_PUBLIC_WS_URL!
   export const ARBITRUM_CHAIN_ID = 42161
   export const ARBITRUM_RPC = `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
   export const USDC_ARBITRUM = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
   export const USDT_ARBITRUM = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
   export const PRESET_AMOUNTS = [1, 3, 5, 10]
   export const MIN_TIP = 1
   export const MAX_TIP = 500
   ```

7. CREATE LAYOUT.TSX
   Inter font, background #09090F, meta tags for Tipflow

8. CREATE .ENV.EXAMPLE
   All variable names with empty values. Never put real keys.

9. CREATE WEBSOCKET SERVER
   Create websocket-server/ as a separate Node.js project:
   - websocket-server/package.json (name: tipflow-ws, express + socket.io + cors)
   - websocket-server/index.ts — Express on port 3001, Socket.io
   - GET /health → { ok: true, timestamp: Date.now() }
   - POST /webhook → log body and return { received: true } (full logic in Phase 4)
   - websocket-server/tsconfig.json

10. VERIFY
    npm run dev → no errors, dark page at localhost:3000
    cd websocket-server && npx ts-node index.ts → "Server running on :3001"

PHASE 1 SUCCESS CRITERIA:
✓ npm run dev starts without TypeScript errors
✓ WebSocket server starts on port 3001
✓ localhost:3000 shows dark background
✓ No purple, blue, or green used as primary color anywhere
✓ package.json shows particle SDK at exactly "1.1.1" (no ^ caret)
```

---

## PHASE 2 — Magic + EIP-7702 + Particle UA

```
PHASE 2: Wire Magic SDK + EIP-7702 + Particle Universal Accounts.
This is the core technical phase. Nothing else matters if this breaks.

BEFORE STARTING: Clone and study this reference implementation:
github.com/Particle-Network/ua-7702-magic-demo
Understand how Magic signs the 7702 authorization before writing code.

1. CREATE SRC/LIB/MAGIC.TS
   Browser-side Magic SDK init:
   ```typescript
   'use client'
   import { Magic } from 'magic-sdk'
   import { EthereumExtension } from '@magic-ext/evm'
   import { ARBITRUM_CHAIN_ID, ARBITRUM_RPC } from './constants'

   let magic: Magic | null = null

   export function getMagic(): Magic {
     if (typeof window === 'undefined') throw new Error('Magic is client-only')
     if (!magic) {
       magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY!, {
         extensions: [
           new EthereumExtension({
             rpcUrl: ARBITRUM_RPC,
             chainId: ARBITRUM_CHAIN_ID,
           }),
         ],
       })
     }
     return magic
   }
   ```

2. CREATE SRC/HOOKS/USEMAGICAUTH.TS
   ```typescript
   'use client'
   import { useState, useCallback } from 'react'
   import { getMagic } from '@/lib/magic'

   export function useMagicAuth() {
     const [loading, setLoading] = useState(false)
     const [address, setAddress] = useState<string | null>(null)

     const sendOTP = useCallback(async (email: string) => {
       setLoading(true)
       const magic = getMagic()
       await magic.auth.loginWithEmailOTP({ email, showUI: false })
       setLoading(false)
     }, [])

     const getAddress = useCallback(async (): Promise<string> => {
       const magic = getMagic()
       const accounts = await magic.wallet.getInfo()
       return accounts.publicAddress
     }, [])

     const sign7702 = useCallback(async (contractAddress: string) => {
       const magic = getMagic()
       return magic.wallet.sign7702Authorization({ contractAddress })
     }, [])

     const logout = useCallback(async () => {
       const magic = getMagic()
       await magic.user.logout()
       setAddress(null)
     }, [])

     return { sendOTP, getAddress, sign7702, logout, loading, address }
   }
   ```

3. CREATE SRC/LIB/PARTICLE.TS
   ```typescript
   import { UniversalAccount } from '@particle-network/universal-account-sdk'
   import { ARBITRUM_CHAIN_ID } from './constants'

   export function createUniversalAccount(ownerAddress: string): UniversalAccount {
     return new UniversalAccount({
       projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID!,
       clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY!,
       appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID!,
       ownerAddress,
       tradeConfig: {
         universalGas: true,
       },
     })
   }
   ```

4. CREATE SRC/HOOKS/USEPARTICLEUA.TS
   ```typescript
   'use client'
   import { useState, useCallback } from 'react'
   import { createUniversalAccount } from '@/lib/particle'
   import { ARBITRUM_CHAIN_ID } from '@/lib/constants'
   import { ethers } from 'ethers'
   import { getMagic } from '@/lib/magic'

   export function useParticleUA() {
     const [loading, setLoading] = useState(false)

     const sendTip = useCallback(async ({
       magicEOA,
       streamerUA,
       amountUsd,
       sign7702Auth,
     }: {
       magicEOA: string
       streamerUA: string
       amountUsd: number
       sign7702Auth: (contractAddress: string) => Promise<string>
     }) => {
       setLoading(true)
       try {
         const ua = createUniversalAccount(magicEOA)
         const magic = getMagic()
         const provider = new ethers.BrowserProvider(magic.rpcProvider as any)
         const signer = await provider.getSigner()

         const tx = await ua.createTransferTransaction({
           to: streamerUA,
           value: amountUsd.toString(),
           token: 'USDC',
           chainId: ARBITRUM_CHAIN_ID,
         })

         const signedTx = await signer.sendTransaction(tx)
         await signedTx.wait()
         return signedTx.hash
       } finally {
         setLoading(false)
       }
     }, [])

     const getBalance = useCallback(async (ownerAddress: string) => {
       const ua = createUniversalAccount(ownerAddress)
       return ua.getPrimaryAssets()
     }, [])

     return { sendTip, getBalance, loading }
   }
   ```

5. CREATE SRC/HOOKS/USETIPFLOW.TS
   State machine for the 5-step fan flow:
   States: 'select' | 'email' | 'otp' | 'sending' | 'success' | 'error'
   
   Manages: amount, message, email, fanAddress, txHash
   
   Functions:
   - selectAmount(n: number)
   - setEmail(email: string)
   - submitEmail() → calls sendOTP, transitions to 'otp'
   - submitOTP(otp: string) → verifies Magic, transitions to 'sending'
   - executeTip() → calls Particle UA sendTip, transitions to 'success'
   - reset() → back to 'select'

6. TEST ON /TIP/[USERNAME] (basic test harness)
   Create a minimal test page at /tip/test that:
   - Has email input
   - Has "Login with Magic" button
   - Shows Magic address after login
   - Shows "Delegate EIP-7702" button
   - Has "Send $1 tip" button → sends to hardcoded test address
   - Logs tx hash to console

PHASE 2 SUCCESS CRITERIA:
✓ Magic email login works (real OTP received)
✓ EIP-7702 delegation fires (visible on Arbiscan)
✓ $1 USDC moves from BSC to Arbitrum (real mainnet)
✓ Transaction hash visible on arbiscan.io
✓ No TypeScript errors
```

---

## PHASE 3 — Fan Tip Page (Complete UI)

```
PHASE 3: Build the complete fan tip page at /tip/[username].
This is the most important page for the demo and judges.

RESPONSIVE RULES FOR THIS PAGE (mandatory):
- Mobile first. Max-width 390px card, centered.
- Card: width calc(100% - 32px) on mobile (<480px)
- Card padding: 20px mobile, 24px desktop
- Amount grid: ALWAYS 2×2 CSS grid (never flex)
- OTP boxes: sized by screen (see below)
- Touch targets: min 44px height on all buttons
- No horizontal overflow at any screen width

OTP BOX SIZES (critical for mobile):
≥480px: width 45px, height 54px, gap 8px
<480px: width 40px, height 50px, gap 7px
<375px: width 36px, height 46px, gap 5px

COMPONENT SPECS:

StreamerCard:
  - Orange accent background (var(--ord) / var(--orb))
  - Orange gradient top stripe (2px, linear-gradient 90deg #F97316 #FBBF24)
  - 44px circular avatar (initials, orange bg)
  - Display name, large and bold
  - Green live dot (7px, blink animation) + "Live · 2.4K watching"
  - Mobile: full width of card

AmountSelector:
  - Label: "Choose an amount" — 11px, uppercase, #444455
  - 2×2 grid, gap 9px
  - Each button: full grid cell width, 14px padding vertical
  - Selected: background var(--ord), border var(--orb), color var(--or)
  - Unselected: background var(--s1), border var(--b), color var(--t)
  - Font size: 20px, weight 900
  - Custom input below grid: placeholder "Custom amount"

EmailModal (step 2):
  - Orange envelope icon (48px circle, var(--ord) bg)
  - Heading 20px/800: "Where do we send your receipt?"
  - Subtext: "Confirming your $X tip to [streamer]"
  - Email input (full width)
  - Primary orange button: "Continue"
  - Disabled if email empty
  - "← Back" ghost link

OTPModal (step 3):
  - Green lock icon (48px circle, var(--tld) bg)
  - Heading: "Check your inbox"
  - Subtext: "Code sent to [email]"
  - 6 OTP boxes side by side
  - Auto-focus: next box on input, previous on backspace
  - Filled box: border-color var(--or)
  - "Verify and send tip" primary button
  - "Resend code" text link

SendingState (step 4):
  - Orange spinner (border 2.5px, border-top var(--or), rotate animation)
  - Heading: "Routing your $X tip"  (NO crypto language here)
  - Subtext: "Reaching [streamer name]"
  - ChainRoute pill: BSC → Particle UA → Arbitrum
    Small pill: background var(--s1), border var(--b)
    Text: "BSC" grey | arrow | "Particle UA" orange | arrow | "Arbitrum" teal
  - DO NOT show wallet addresses, tx hashes, or any technical detail

SuccessState (step 5):
  - Teal check icon (64px circle, var(--tld) bg, var(--tlb) border)
  - Heading: "$X sent to [streamer]!" — 24px/900
  - Subtext: "Watch for your name to appear on stream"
  - Optional: fan message in quote block
  - Receipt table (var(--s1) bg, var(--b) border):
    Row 1: Amount | $X (white)
    Row 2: Platform fee | $0.00 (teal)
    Row 3: Settled on | Arbitrum · 4s (orange)
  - "Tip again" button (var(--ord) bg, var(--orb) border, var(--or) text)

Progress dots (top of card):
  5 dots | active: 22px wide, orange | inactive: 7px wide, var(--s3)
  Height: 3px, border-radius 2px

API CALLS IN THIS PHASE:
- GET /api/streamers/[username] → load streamer data (name, ua_address)
- POST /api/tips → record tip { streamerId, fanEmail, amountUsd, message, txHash, sourceChain }

PHASE 3 SUCCESS CRITERIA:
✓ Complete flow works on real iPhone (not just Chrome devtools)
✓ No OTP box overflow at 320px
✓ Real tip confirmed on Arbitrum mainnet
✓ Tip recorded in Supabase
✓ Zero crypto language visible to fan (no USDC, no Arbitrum on fan side except receipt)
✓ Amount buttons never overflow their grid
```

---

## PHASE 4 — Real-Time OBS Overlay

```
PHASE 4: Alchemy webhook → WebSocket server → OBS overlay animation.
The demo's magic moment. This must work flawlessly.

WEBSOCKET SERVER (websocket-server/index.ts) — complete implementation:

```typescript
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

app.use(cors())
app.use(express.json())

// Health check — ping this every 5 min to keep Render alive
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: Date.now() })
})

// Alchemy Notify webhook
app.post('/webhook', async (req, res) => {
  // Verify auth token
  const token = req.headers['x-alchemy-token']
  if (token !== process.env.ALCHEMY_WEBHOOK_AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { activity } = req.body
  if (!activity?.length) return res.json({ received: true })

  for (const event of activity) {
    // Only USDC transfers to known streamer addresses
    if (event.asset !== 'USDC' && event.asset !== 'USDT') continue
    if (event.category !== 'token') continue

    // Look up streamer by ua_address
    const { data: streamer } = await supabase
      .from('streamers')
      .select('id, username, display_name')
      .eq('ua_address', event.toAddress.toLowerCase())
      .single()

    if (!streamer) continue

    // Update tip status in DB
    await supabase
      .from('tips')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('tx_hash', event.hash)

    // Look up fan details from tip record
    const { data: tip } = await supabase
      .from('tips')
      .select('fan_email, amount_usd, message')
      .eq('tx_hash', event.hash)
      .single()

    // Emit to overlay room
    const fanName = tip?.fan_email?.split('@')[0] || 'Anonymous'
    io.to(`overlay:${streamer.username}`).emit('tip_received', {
      fanName,
      amount: tip?.amount_usd || parseFloat(event.value),
      message: tip?.message || '',
      txHash: event.hash,
      timestamp: Date.now(),
    })
  }

  res.json({ received: true })
})

// Test alert endpoint (for dashboard "Test alert" button)
app.post('/test-alert/:username', (req, res) => {
  const { username } = req.params
  io.to(`overlay:${username}`).emit('tip_received', {
    fanName: 'TestFan',
    amount: 5,
    message: 'This is a test alert!',
    txHash: '0xtest',
    timestamp: Date.now(),
  })
  res.json({ sent: true })
})

io.on('connection', (socket) => {
  socket.on('join_overlay', (username: string) => {
    socket.join(`overlay:${username}`)
  })
  socket.on('disconnect', () => {})
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Tipflow WebSocket server running on :${PORT}`)
})
```

OVERLAY PAGE /overlay/[username]:

Critical requirements:
- background: transparent (html, body { background: transparent !important; })
- Nothing visible when idle
- Alert slides in from RIGHT side (alertIn animation)
- Alert positioned: fixed, bottom 24px, right 24px
- Alert auto-dismisses after 5 seconds

```tsx
'use client'
import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { AlertCard } from '@/components/overlay/AlertCard'

interface TipAlert {
  fanName: string
  amount: number
  message: string
  txHash: string
}

export default function OverlayPage({ params }: { params: { username: string } }) {
  const [alert, setAlert] = useState<TipAlert | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_WS_URL!)
    s.emit('join_overlay', params.username)
    s.on('tip_received', (data: TipAlert) => {
      setAlert(data)
      setTimeout(() => setAlert(null), 5000)
    })
    setSocket(s)
    return () => { s.disconnect() }
  }, [params.username])

  if (!alert) return null

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24 }}>
      <AlertCard {...alert} />
    </div>
  )
}
```

Make sure layout.tsx for /overlay/[username] has:
```tsx
export default function OverlayLayout({ children }) {
  return (
    <html>
      <body style={{ background: 'transparent', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
```

AlertCard component:
- background: rgba(10,8,5,0.93)
- border: 1px solid rgba(249,115,22,0.45)
- border-radius: 14px
- min-width: 300px, max-width: 420px
- padding: 14px 18px
- animation: alertIn 0.45s cubic-bezier(0.16,1,0.3,1)
- Left stripe: position absolute, left 0, width 3px, height 100%, bg #F97316
- Top countdown bar: position absolute, top 0, left 0, height 2px,
  bg #F97316, animation shrink 5s linear forwards
- Fan avatar: 44px circle, orange dim bg + border, initial letter
- Fan name + amount: white, 15px/700 bold
- Message: rgba(255,255,255,0.55), 12px

PHASE 4 SUCCESS CRITERIA:
✓ WebSocket server deployed and responding on Render
✓ Alchemy Notify fires for USDC transfers on Arbitrum Mainnet
✓ Alert appears on overlay within 8 seconds of tip
✓ Overlay has transparent background in OBS
✓ Alert auto-dismisses after 5 seconds
✓ "Test alert" button on dashboard works
✓ Latency logged: target under 10 seconds
```

---

## PHASE 5 — Streamer Dashboard

```
PHASE 5: Build /dashboard — complete streamer earnings view.
Protected by middleware.ts.

MIDDLEWARE (src/middleware.ts):
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('tipflow_session')
  const protectedPaths = ['/dashboard', '/setup', '/settings']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))
  
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/setup/:path*', '/settings/:path*'],
}
```

RESPONSIVE RULES FOR DASHBOARD:
- Mobile (<768px): ALL cards single column
- Tablet (768px+): stat cards 3-col, link cards 2-col
- Max content width: 960px, centered with container padding
- Tip link URLs: font-mono, overflow hidden, text-overflow ellipsis, block
- Never show full wallet addresses — truncate: first6...last4

COMPONENTS:

StatCard (3 of these):
  - Total earned (gold accent top stripe)
  - This month (orange accent top stripe)
  - Avg tip (teal accent top stripe)
  Each: background #18181F, border var(--b), border-radius 12px
  Label: 11px uppercase muted | Value: 24px/900 white | Sub: 12px muted

BalanceCard:
  - background var(--ord), border var(--orb)
  - Label: "Available to withdraw" — orange, 12px uppercase
  - Balance: 36px/900 white, e.g. "$47.50"
  - Sub: "USDC · Arbitrum One" — muted 12px
  - Withdraw button: primary orange, right side

TipLinkCard:
  - Monospace URL: tipflow.app/tip/[username]
  - Truncate with ellipsis if overflows
  - "Copy link" button (orange dim)
  - "Share" button (ghost)

OverlayCard:
  - Monospace URL: tipflow.app/overlay/[username]
  - "Copy URL" button (orange dim)
  - "Test alert" button → POST to websocket-server /test-alert/[username]

TipFeed:
  - Recent tips, newest first
  - Each row: fan initial avatar | name + message | +$amount (teal) | time ago · chain
  - "No tips yet" empty state with orange icon
  - Fetch from GET /api/tips/[streamerId]

PHASE 5 SUCCESS CRITERIA:
✓ Real USDC balance shown (from Particle UA getPrimaryAssets)
✓ Real tip history from Supabase
✓ Withdraw sends real transaction on Arbitrum
✓ Works on 320px mobile without horizontal scroll
✓ Protected — redirects to /login if no session
```

---

## PHASE 6 — Landing + Login + Setup

```
PHASE 6: Complete public funnel — landing, login, setup pages.

LANDING PAGE (/):
Hero section responsive spec:
  Mobile (<768px):
    - Single column, centered text
    - Right product preview: HIDDEN (display none)
    - H1: 36px/900 (<480px: 32px)
    - CTAs: stack vertically, full width
    - padding: 40px 0 36px (<480px: 32px 0 28px)
  Tablet (768-1023px):
    - Single column, CTAs side by side
    - H1: 42px
  Desktop (1024px+):
    - Split: left 52%, right 48%
    - H1: 48px
    - Right: fan tip card preview + alert card preview

H1 text:
  Line 1: "Fans anywhere."
  Line 2: "Tips instantly."
  Line 3: "Zero friction." ← this line in orange (#F97316)

Stats bar:
  Mobile (<480px): 2×2 grid
  Desktop: 4-column row
  Values: $3.1M+ | 8s | 195 | 0%
  Labels: Paid to creators | Avg tip speed | Countries | Platform cut

Features (3 cards):
  Each card: orange left border stripe (3px), no fill
  Icons: Tabler icons (ti-world, ti-bolt, ti-shield-check)
  Mobile: 1 column | Tablet: 2 column | Desktop: 3 column

HowItWorks (3 steps):
  Ghost step numbers: "01", "02", "03" — 52px/900, color rgba(249,115,22,0.15)
  Mobile: stacked with horizontal dividers
  Desktop: 3 columns with vertical dividers

LOGIN PAGE (/login):
  - Dark centered card, max-width 400px
  - Tipflow logo above
  - "Sign in to your account" heading
  - Email input
  - "Continue with email" primary button → sends Magic OTP
  - OTP input appears below (same page, no navigation)
  - On success: check Supabase for existing streamer
    - Found: set session cookie → redirect to /dashboard
    - Not found: set session cookie → redirect to /setup
  - "Fans: visit tipflow.app/tip/[streamer-name]" small note

SETUP PAGE (/setup):
  3 steps — show progress (1 of 3, 2 of 3, 3 of 3):
  
  Step 1 — Choose username:
    - Input: "Pick your username" (letters, numbers, hyphens only)
    - Check availability in real-time (debounced API call)
    - Green tick if available, red if taken
    - "Continue" → save to Supabase, proceed to step 2
  
  Step 2 — Set up overlay:
    - Show overlay URL: tipflow.app/overlay/[username]
    - Copy button
    - 3-step OBS instructions with numbered steps
    - "Next" button → step 3
  
  Step 3 — Send test alert:
    - "Send a test alert to confirm it's working"
    - "Fire test alert" button → triggers WebSocket
    - If overlay is open: user sees the alert
    - "Looks good, go to dashboard" button → /dashboard

PHASE 6 SUCCESS CRITERIA:
✓ Full journey: landing → login → setup → dashboard works end-to-end
✓ New streamer can onboard in under 2 minutes
✓ Landing page readable on 320px phone
✓ Login Magic OTP works in production (not localhost)
✓ Username availability check works
```

---

## PHASE 7 — Responsive QA + Polish

```
PHASE 7: Fix all responsive issues. Zero overflow on any page.

TEST AT THESE EXACT WIDTHS (use Chrome DevTools):
320px, 375px, 390px, 412px, 480px, 768px, 1024px, 1280px

OVERFLOW FIX CHECKLIST:
Run this audit on every page:
1. Open at 320px in Chrome DevTools
2. Scroll horizontally — there should be NO scrollbar
3. If scrollbar exists: find element with overflow and fix it

COMMON OVERFLOW FIXES:
- Flex children: add min-width: 0
- Grid children: use minmax(0, 1fr) not 1fr
- Text: add overflow-wrap: break-word
- URLs in cards: add overflow: hidden; text-overflow: ellipsis; white-space: nowrap
- Images: max-width: 100%; height: auto
- Stats grid on mobile: gridTemplateColumns: 'repeat(2, 1fr)' below 480px
- OTP boxes at 320px: width 36px, height 46px, gap 5px

LOADING STATES (add to every async component):
- Dashboard balance: skeleton loader while fetching
- Tip feed: skeleton rows while loading
- Balance card: "Loading..." with pulse animation

ERROR STATES (add to every async operation):
- Magic login fail: "Login failed. Please try again."
- Particle UA fail: "Payment failed. Your funds are safe. Try again."
- Network error: "Connection error. Check your internet and retry."
- Invalid streamer: /tip/unknown → "Streamer not found" page

FINAL POLISH:
- Favicon: use a simple orange lightning bolt or TF monogram
- Page titles: "Tip NightOwl | Tipflow", "Dashboard | Tipflow", etc.
- Meta descriptions on all pages
- OG image for landing page sharing

PHASE 7 SUCCESS CRITERIA:
✓ Zero horizontal overflow at 320px on every page
✓ Every async state has loading + error handling
✓ OTP boxes never overflow at any screen size
✓ Touch targets min 44px everywhere
✓ Tip link URLs always truncate with ellipsis
```

---

## PHASE 8 — End-to-End Test + Deploy

```
PHASE 8: Final deployment and full end-to-end testing.

DEPLOYMENT STEPS:
1. Push to GitHub (verify .env.local is in .gitignore)
2. Deploy websocket-server to Render (see docs/deploy.md)
3. Deploy Next.js to Vercel (see docs/deploy.md)
4. Update all env vars in Vercel and Render dashboards
5. Update Alchemy Notify webhook URL to Render URL
6. Update Magic allowed origins with Vercel URL
7. Update Particle allowed domains with Vercel URL

END-TO-END TEST CHECKLIST:
Run this on production URLs, not localhost:

Fan flow:
[ ] Visit tipflow.app/tip/nightowl on mobile phone
[ ] Select $5
[ ] Enter real email
[ ] Receive and enter OTP
[ ] Watch sending animation
[ ] Confirm success + receipt shows Arbitrum
[ ] Check Supabase: tip row with status 'confirmed'

Overlay:
[ ] Open tipflow.app/overlay/nightowl in OBS (Browser Source)
[ ] Set dimensions: 1920 x 1080
[ ] Send real $5 tip
[ ] Alert appears within 10 seconds
[ ] Alert auto-dismisses after 5 seconds
[ ] Background is transparent in OBS

Dashboard:
[ ] Login with streamer email
[ ] Balance shows updated USDC amount
[ ] Tip appears in recent feed
[ ] Copy tip link works
[ ] Test alert fires and appears in overlay
[ ] Withdraw sends real USDC

DEMO REHEARSAL:
Run the full 3-minute demo script from docs/plan.md
Do this 5 times before submission day.
Record video on the 5th run.

SUBMISSION:
[ ] Video uploaded (3 min max)
[ ] GitHub repo public
[ ] README.md with: what it does, tech stack, how to run
[ ] Deployed URL working
[ ] Submit via Encode Club platform
[ ] Apply for Arbitrum Founder House London (July 10-12)

PHASE 8 SUCCESS CRITERIA:
✓ Both servers live and responding
✓ Full fan flow works on real phone on production
✓ Overlay fires in OBS
✓ Demo runs clean in under 3 minutes
✓ Submitted to Encode Club
```

---

## RECOVERY PROMPT — Paste if Claude Code Breaks Something

```
STOP. Do not make any more changes.

Review what you just changed and identify what broke.
Look at the error message carefully.

RULES FOR FIXING:
1. Fix ONLY the broken thing. Do not refactor anything else.
2. Do not change any CSS color values or design tokens.
3. Do not upgrade any package versions.
4. Do not change the folder structure.
5. The particle SDK must stay at exactly 1.1.1.

After fixing, confirm:
- npm run dev starts without errors
- The page that was broken now works
- Nothing else changed

If you cannot identify the cause: revert the last change entirely.
```

---

## Package.json Lockfile Note

After Phase 1 scaffold, run:
```bash
npm install
```
Then immediately check package-lock.json confirms:
```json
"@particle-network/universal-account-sdk": {
  "version": "1.1.1",
```
If it shows any other version, run:
```bash
npm install @particle-network/universal-account-sdk@1.1.1 --save-exact
```