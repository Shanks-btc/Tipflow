# Tipflow — Build Plan
## 9 days. Phase by phase. No skipping steps.

---

## Pre-Build Checklist (Do Before Day 1)

Complete all of these before writing a single line of code.

| Task | URL | Keys Needed |
|------|-----|-------------|
| Create Particle project | dashboard.particle.network | Project ID, Client Key, App ID |
| Create Magic app | dashboard.magic.link | Publishable Key, Secret Key |
| Create Alchemy app (Arbitrum Mainnet) | dashboard.alchemy.com | API Key |
| Set up Alchemy Notify webhook | dashboard.alchemy.com/notify | Auth Token |
| Create Supabase project | supabase.com | URL, Anon Key, Service Role Key |
| Fill .env.local | Your editor | All of the above |

**Alchemy Notify setup:**
- Address Activity webhook
- Network: Arbitrum Mainnet
- Address: add streamer UA addresses as they onboard
- Webhook URL: https://your-render-domain.onrender.com/webhook
- Set auth token — copy to ALCHEMY_WEBHOOK_AUTH_TOKEN

---

## Day 1 — Project Scaffold

**Goal:** `npm run dev` starts without errors. No blockchain yet.

### Tasks
- [ ] Init Next.js 14 App Router + TypeScript + Tailwind
- [ ] Create full folder structure (see architecture.md)
- [ ] Install all dependencies (exact versions)
- [ ] Set up globals.css (CSS variables + keyframes)
- [ ] Set up tailwind.config.js (custom breakpoints + colors)
- [ ] Create src/lib/constants.ts
- [ ] Create src/lib/magic.ts (SDK init only, no calls)
- [ ] Create src/lib/particle.ts (SDK init only, no calls)
- [ ] Create src/lib/supabase.ts + supabase-server.ts
- [ ] Create src/app/layout.tsx (Inter font, dark bg)
- [ ] Create placeholder landing page (skeleton only)
- [ ] Create websocket-server/ with working index.ts on port 3001
- [ ] Run Supabase migration 001_initial.sql
- [ ] Verify: both servers start with no errors

### Dependencies to install
```bash
npm install magic-sdk @magic-ext/evm
npm install @particle-network/universal-account-sdk@1.1.1
npm install @supabase/supabase-js @supabase/ssr
npm install socket.io-client
npm install ethers@6

# websocket-server only
npm install express socket.io cors dotenv
npm install -D @types/express @types/cors ts-node typescript
```

### Success criteria
- `npm run dev` → no TypeScript errors
- `npx ts-node websocket-server/index.ts` → "Server running on :3001"
- http://localhost:3000 shows dark background page

---

## Day 2 — Magic + EIP-7702 + Particle UA Wiring

**Goal:** Send one real USDC transfer from BSC to Arbitrum.
This is the most important day of the build.

### Reference
Clone and study: github.com/Particle-Network/ua-7702-magic-demo
Do NOT build this from scratch. Understand the official demo first.

### Tasks
- [ ] Implement useMagicAuth hook:
  - loginWithEmail(email) → triggers Magic OTP
  - verifyOTP(otp) → completes Magic login
  - getAccount() → returns EOA address
  - logout()
- [ ] Implement EIP-7702 delegation:
  - magic.wallet.sign7702Authorization({ contractAddress: UA_CONTRACT })
  - magic.wallet.send7702Transaction({ ... })
  - Fan EOA becomes Universal Account on Arbitrum
- [ ] Implement useParticleUA hook:
  - createUA(magicEOA) → UniversalAccount instance
  - getPrimaryAssets() → unified balance
  - createTransferTransaction(to, amount) → cross-chain tx
  - sendTransaction(tx, authorization) → execute
- [ ] Wire up on /tip/[username] as a test (basic UI, not final)
- [ ] Test: real Magic email login works
- [ ] Test: EIP-7702 delegation fires on Arbitrum
- [ ] Test: $1 USDC transfer BSC → Arbitrum confirms

### Critical notes
- EIP-7702 happens ONCE per user. Check if already delegated.
- Magic signs the authorization — do NOT ask user to sign manually
- Particle UA v1.1.1 API: UniversalAccount({ ownerAddress, ... })
- Always check for eip7702Auth in userOps before sending
- If V2 migration starts: check Particle Slack, pin to 1.1.1

### Success criteria
- Real $1 tip transacts from BSC to Arbitrum on mainnet
- Arbitrum transaction visible on arbiscan.io
- No errors in console

---

## Day 3 — Fan Tip Page (Complete UI + Flow)

**Goal:** /tip/[username] is fully functional end-to-end.

### Tasks
- [ ] Build StreamerCard (avatar initials, name, live dot)
- [ ] Build AmountSelector (4 presets + custom, 2x2 grid)
- [ ] Build EmailModal (email input, continue)
- [ ] Build OTPModal (6 boxes, auto-focus next, backspace)
- [ ] Build SendingState (spinner + chain route pill)
- [ ] Build SuccessState (checkmark + receipt table)
- [ ] Wire TipCard state machine:
  select → email → otp → sending → success
- [ ] Wire Magic login into email/otp steps
- [ ] Wire Particle UA transaction into sending step
- [ ] Wire API route POST /api/tips to record tip in Supabase
- [ ] Load real streamer data from Supabase via /api/streamers/[username]
- [ ] Handle errors gracefully (Magic fail, network fail, etc.)
- [ ] Full mobile responsive (see architecture.md responsive rules)

### OTP box responsive sizing
```
≥480px: width 45px, height 54px, gap 8px
<480px: width 40px, height 50px, gap 7px
<375px: width 36px, height 46px, gap 5px
```

### Success criteria
- Full fan flow works on real phone (not just browser dev tools)
- OTP boxes do not overflow on 320px screen
- $5 tip from BSC confirms, fan sees success screen
- Tip recorded in Supabase

---

## Day 4 — Real-Time Overlay (Alchemy → Socket.io → OBS)

**Goal:** Tip fires, name appears on overlay in under 10 seconds.

### Tasks
- [ ] Complete websocket-server/index.ts:
  - POST /webhook validates Alchemy auth token
  - Parses USDC Transfer events from activity[]
  - Looks up streamer by ua_address in Supabase
  - Emits tip_received to room `overlay:${username}`
- [ ] Build /overlay/[username] page:
  - Transparent background (no background color)
  - Connects to WebSocket on mount (useOverlaySocket hook)
  - Joins room overlay:username
  - Listens for tip_received
  - Renders AlertCard with alertIn animation
  - AlertCard auto-dismisses after 5 seconds
- [ ] Build AlertCard component:
  - Orange left stripe, shrinking countdown bar
  - Fan name + amount + message
  - Glassmorphism card on dark stream bg
- [ ] Test full pipeline:
  - Send real tip → Alchemy Notify fires → WebSocket → overlay
  - Measure latency (target: under 10 seconds)
- [ ] Add "fire test alert" button trigger in dashboard
- [ ] Deploy websocket-server to Render

### Alchemy Notify webhook body structure
```typescript
// activity[] contains transfer events
interface AlchemyActivity {
  fromAddress: string
  toAddress: string
  value: number
  asset: string // "USDC"
  hash: string
  blockNum: string
  category: string // "token"
}
```

### Latency budget
```
Arbitrum confirmation: ~2s
Alchemy Notify delay:  ~1-3s
WebSocket relay:       ~0.1s
UI render:             ~0.1s
Total target:          < 8s ✓
```

### Success criteria
- Send tip → name appears on overlay within 8 seconds
- Overlay is fully transparent in OBS
- Alert auto-dismisses after 5 seconds
- Test alert button works from dashboard

---

## Day 5 — Streamer Dashboard

**Goal:** /dashboard is complete and data-accurate.

### Tasks
- [ ] Build StatCard (total earned, this month, avg tip)
- [ ] Build BalanceCard:
  - Real USDC balance from getPrimaryAssets()
  - Withdraw button triggers WithdrawModal
- [ ] Build WithdrawModal:
  - Amount input
  - Destination (defaults to their address)
  - Executes createTransferTransaction()
- [ ] Build TipLinkCard:
  - tipflow.app/tip/[username]
  - Copy button + share button
  - Truncated URL on mobile
- [ ] Build OverlayCard:
  - tipflow.app/overlay/[username]
  - Copy URL button
  - "Test alert" button → fires via WebSocket
- [ ] Build TipFeed:
  - Fetches from /api/tips/[streamerId]
  - Fan initial avatar, name, amount (green), message, time, chain
- [ ] Wire all data from Supabase
- [ ] Protect route via middleware.ts
- [ ] Full responsive (single column on mobile)

### Success criteria
- Real USDC balance shown (live, from Particle UA)
- Real tip history from Supabase
- Withdraw sends real USDC on Arbitrum
- Works on mobile without horizontal scroll

---

## Day 6 — Landing Page + Login + Setup

**Goal:** Complete public-facing funnel.

### Tasks
- [ ] Build Navbar (responsive — 3 variants by breakpoint)
- [ ] Build Hero section:
  - Mobile: single column, right preview hidden
  - Desktop: split layout, product preview on right
  - H1: "Fans anywhere.\nTips instantly.\nZero friction."
  - "Zero friction." in orange
- [ ] Build StatsBar:
  - Mobile: 2×2 grid
  - Desktop: 4-column row
- [ ] Build Features (orange left-border accent on cards)
- [ ] Build HowItWorks (01, 02, 03 ghost numerals)
- [ ] Build CTABand (dark surface, headline + button)
- [ ] Build /login page (Magic email form only)
- [ ] Build /setup page (3 steps: username → overlay → test)
  - Step 1: pick username, check availability, save to Supabase
  - Step 2: show overlay URL + OBS instructions
  - Step 3: send test alert, confirm it works
  - Redirect to /dashboard on complete
- [ ] Implement middleware.ts protecting dashboard/setup/settings
- [ ] Build /settings page (display name, avatar, alert duration)

### Success criteria
- Complete user journey: landing → login → setup → dashboard
- New streamer can be up and running in under 2 minutes
- Landing page renders correctly on 320px phone

---

## Day 7 — Polish + Responsive QA

**Goal:** Zero overflow issues on any screen size.

### Responsive test checklist (test every page at these widths)
```
320px  — Samsung Galaxy S8, iPhone SE gen 1
375px  — iPhone SE gen 3
390px  — iPhone 14
412px  — Pixel 7
480px  — Large phones
768px  — iPad mini (portrait)
1024px — iPad Pro (landscape)
1280px — Desktop
1440px — Large desktop
```

### Tasks
- [ ] Fix all horizontal overflow issues (add overflow-x: hidden)
- [ ] Fix OTP boxes on 320px (use <375px sizing)
- [ ] Fix stats bar (2×2 grid on mobile)
- [ ] Fix hero (single column, no right preview on mobile)
- [ ] Fix dashboard cards (single column on mobile)
- [ ] Fix URL truncation (tip links, overlay URLs)
- [ ] Verify all touch targets are min 44×44px
- [ ] Add loading skeletons on dashboard (while balance fetches)
- [ ] Add proper error states on every async action
- [ ] Add form validation on all inputs
- [ ] Test /overlay in OBS (transparent bg, correct dimensions)
- [ ] Fix any TypeScript errors

---

## Day 8 — End-to-End Test With Real Funds

**Goal:** Full demo scenario runs perfectly from start to finish.

### Test scenario (run 5 times)
```
1. Open tipflow.app/tip/nightowl on mobile (390px)
2. Select $5
3. Enter test fan email
4. Enter OTP
5. Watch sending animation
6. Confirm success screen shows $0.00 fee + "Arbitrum · 4s"
7. Watch overlay alert appear on second screen
8. Confirm tip in Supabase (check dashboard)
9. Verify balance increased on dashboard
10. Test withdraw function
```

### Latency log (record for each test)
```
Run 1: ___s
Run 2: ___s
Run 3: ___s
Run 4: ___s
Run 5: ___s
Average: ___s (target: under 10s)
```

### Pre-funded demo accounts
- Fan account 1: pre-fund with $20 USDT on BSC
- Fan account 2: pre-fund with $20 USDC on Base
- Keep $10 USDT on BSC and $10 USDC on Base as minimum at all times

---

## Day 9 — Deploy + Submit

**Goal:** Everything live, demo recorded, submitted.

### Deployment
- [ ] Deploy Next.js to Vercel (see deploy.md)
- [ ] Deploy WebSocket server to Render (see deploy.md)
- [ ] Update NEXT_PUBLIC_WS_URL to Render URL in Vercel env vars
- [ ] Update Alchemy Notify webhook URL to Render URL
- [ ] Test full flow on production URLs
- [ ] Verify Arbitrum Mainnet (not testnet) throughout

### Submission requirements
- [ ] Deployed and accessible URL
- [ ] GitHub repo (clean commit history, no .env.local)
- [ ] README.md explaining what it does
- [ ] Demo video (3 minutes max):
  - Start: "This is what tipping streamers looks like today..."
  - Show: fan tip page on mobile (email only, no wallet)
  - Show: tip confirmation + overlay alert appearing live
  - Show: streamer dashboard with real balance
  - End: Arbitrum Founder House London application submitted
- [ ] Submit via Encode Club platform

### Prize documentation to prepare
- [ ] UA Track: Screenshot of EIP-7702 tx on Arbiscan
- [ ] Arbitrum Bounty: App URL + deployment proof
- [ ] Magic Bonus: Demo of email OTP flow with no wallet visible

---

## Risk Register

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| Particle V2 migration breaks SDK | HIGH | MEDIUM | Pin to 1.1.1, monitor Slack |
| Alchemy Notify latency >10s | HIGH | LOW | Use Render not Vercel for WS server |
| Magic + EIP-7702 combo fails | HIGH | LOW | Start from official ua-7702-magic-demo |
| Demo wallet has no funds | HIGH | LOW | Pre-fund 2 accounts, check before demo |
| OBS overlay breaks live | MEDIUM | MEDIUM | Test in actual OBS the day before |
| Judges compare to Flipstable | MEDIUM | HIGH | Lead with international fan story |
| Arbitrum tx fails on mainnet | MEDIUM | LOW | Test with small amounts ($1) first |
| WebSocket drops during demo | HIGH | LOW | Render keeps server alive, pre-warm |

---

## Demo Script (3 Minutes)

```
[0:00] "Right now, a fan in Manila wants to tip their favourite UK streamer.
        They try Twitch Bits — not available. PayPal — blocked. Bank transfer — rejected.
        They do nothing.
        That happens every day to 40% of the world's streaming audience."

[0:20] "Here's Tipflow."

[0:25] Open tipflow.app/tip/nightowl on phone.
        "I'm the fan. I've never installed MetaMask."
        Select $5. Click Send.
        Enter email. Continue.
        Enter OTP. Verify.

[1:00] "While that's routing through Particle Universal Accounts..."
        Switch to second screen showing stream overlay.
        [8 seconds pass]

[1:10] Alert fires: "PhillyFan92 tipped $5 — Best stream ever!"
        PAUSE. Let the judge process what just happened.

[1:20] "That tip went from BSC, through Particle Universal Accounts,
        settled as USDC on Arbitrum in 4 seconds.
        No MetaMask. No platform cut. No wallet. Just email."

[1:35] Switch to streamer dashboard.
        "Here's the streamer. $5 already in their balance."

[1:50] "Arbitrum's 2-second finality is why this works.
        That's not just infrastructure — that's the product.
        Without Arbitrum, the alert appears after the stream ends."

[2:10] "Streamlabs serves 60 countries. Tipflow opened 195.
        For 40% of the internet's streaming audience, this is
        the first time they've ever been able to tip. Full stop."

[2:35] "Tipflow. Magic embedded wallet. Particle Universal Accounts.
        EIP-7702. Arbitrum.
        Real money. Real fans. Everywhere."

[3:00] END
```