# Tipflow — Deployment Guide

---

## Services Overview

| Service | Platform | Purpose | Cost |
|---------|----------|---------|------|
| Next.js app | Vercel | Frontend + API routes | Free tier |
| WebSocket server | Render | Socket.io persistent server | Free tier |
| Database | Supabase | PostgreSQL | Free tier |
| Blockchain RPC | Alchemy | Arbitrum Mainnet | Free tier |
| Embedded wallet | Magic | Email OTP | Free tier |
| Chain abstraction | Particle | Universal Accounts | Free tier |

**Total hosting cost for hackathon: $0**

---

## 1. Supabase Setup

### Create project
1. Go to supabase.com → New project
2. Name: `tipflow`
3. Region: `eu-west-2` (London — closest to Arbitrum Founder House)
4. Wait for provisioning (~2 minutes)

### Run migration
1. Go to SQL Editor in Supabase dashboard
2. Paste and run the full contents of `supabase/migrations/001_initial.sql`
3. Verify both tables created: `streamers`, `tips`

### Get credentials
Settings → API → copy:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role secret → `SUPABASE_SERVICE_ROLE_KEY`

### Row Level Security
For hackathon: disable RLS on both tables (simplest approach)
```sql
ALTER TABLE streamers DISABLE ROW LEVEL SECURITY;
ALTER TABLE tips DISABLE ROW LEVEL SECURITY;
```

---

## 2. Alchemy Setup

### Create app
1. dashboard.alchemy.com → Create new app
2. Chain: Arbitrum
3. Network: Mainnet
4. Name: `tipflow`
5. Copy API Key → `NEXT_PUBLIC_ALCHEMY_API_KEY`

### Create Notify webhook
1. Dashboard → Notify → Create webhook
2. Webhook type: Address Activity
3. Network: ARB-MAINNET
4. Addresses: (add streamer UA addresses as they register)
5. Webhook URL: `https://YOUR-RENDER-DOMAIN.onrender.com/webhook`
6. Auth token: generate a random string → paste into both:
   - Alchemy dashboard webhook auth field
   - Your `.env.local` as `ALCHEMY_WEBHOOK_AUTH_TOKEN`

### Verify webhook is firing
1. Send a test USDC transfer to a tracked address
2. Alchemy dashboard → Notify → view logs
3. Should see 200 response from your webhook

---

## 3. Magic Setup

### Create app
1. dashboard.magic.link → New application
2. Name: `Tipflow`
3. App type: Generic

### Get credentials
- Publishable API Key → `NEXT_PUBLIC_MAGIC_API_KEY`
- Secret Key → `MAGIC_SECRET_KEY`

### Configure allowed origins
Add to allowlist:
- `http://localhost:3000`
- `https://your-vercel-domain.vercel.app`
- `https://tipflow.app` (when you have custom domain)

---

## 4. Particle Network Setup

### Create project
1. dashboard.particle.network → Create Project
2. Name: `Tipflow`
3. Platform: Web

### Create app within project
- App name: `Tipflow Web`
- Domain: add localhost + your Vercel domain

### Get credentials
Project Settings → copy:
- Project ID → `NEXT_PUBLIC_PARTICLE_PROJECT_ID`
- Client Key → `NEXT_PUBLIC_PARTICLE_CLIENT_KEY`
- App ID → `NEXT_PUBLIC_PARTICLE_APP_ID`

### CRITICAL: V2 Migration Check
Before every build session: check Particle Slack #announcements
for V2 upgrade notices. If V2 drops, assess migration cost immediately.
Never update the SDK past 1.1.1 without checking the changelog.

---

## 5. WebSocket Server — Render Deployment

### Prepare
1. `websocket-server/` is a standalone Node.js app
2. Its own `package.json` — Render treats it separately

### Deploy steps
1. Push to GitHub (make sure websocket-server/ is included)
2. Render dashboard → New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `websocket-server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
   - **Plan:** Free

### Add environment variables in Render
```
ALCHEMY_WEBHOOK_AUTH_TOKEN=your-token-here
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-key-here
PORT=3001
```

### After deploy
- Copy the Render URL: `https://tipflow-ws.onrender.com`
- Update Alchemy Notify webhook URL to: `https://tipflow-ws.onrender.com/webhook`
- Update Vercel env var: `NEXT_PUBLIC_WS_URL=https://tipflow-ws.onrender.com`

### Keep Render alive (free tier sleeps after 15 min)
Add a health check endpoint in index.ts:
```typescript
app.get('/health', (req, res) => res.json({ ok: true }));
```
Use UptimeRobot (free) to ping `/health` every 5 minutes.
This prevents cold starts during the demo.

---

## 6. Vercel Deployment (Next.js)

### Deploy steps
1. Push to GitHub
2. vercel.com → Import project → select tipflow repo
3. Framework: Next.js (auto-detected)
4. Root directory: `.` (the repo root, not websocket-server/)

### Add environment variables in Vercel
Go to Settings → Environment Variables → add all from .env.local:
```
NEXT_PUBLIC_MAGIC_API_KEY
MAGIC_SECRET_KEY
NEXT_PUBLIC_PARTICLE_PROJECT_ID
NEXT_PUBLIC_PARTICLE_CLIENT_KEY
NEXT_PUBLIC_PARTICLE_APP_ID
NEXT_PUBLIC_ALCHEMY_API_KEY
ALCHEMY_WEBHOOK_AUTH_TOKEN
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NEXT_PUBLIC_WS_URL=https://tipflow-ws.onrender.com
```

### After deploy
- Test the deployed URL
- Update Magic allowed origins with the Vercel URL
- Update Particle allowed domains with the Vercel URL

---

## 7. Production Environment Variables (.env.local)

```bash
# Copy this file to .env.local and fill in all values
# NEVER commit .env.local to git

# ─── Magic ───────────────────────────────────────────────
NEXT_PUBLIC_MAGIC_API_KEY=pk_live_
MAGIC_SECRET_KEY=sk_live_

# ─── Particle Network ────────────────────────────────────
NEXT_PUBLIC_PARTICLE_PROJECT_ID=
NEXT_PUBLIC_PARTICLE_CLIENT_KEY=
NEXT_PUBLIC_PARTICLE_APP_ID=

# ─── Alchemy (Arbitrum Mainnet) ───────────────────────────
NEXT_PUBLIC_ALCHEMY_API_KEY=
ALCHEMY_WEBHOOK_AUTH_TOKEN=

# ─── Supabase ────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ─── App URLs ────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

---

## 8. Pre-Demo Deployment Checklist

Run through this the day before demo day.

### 30 minutes before demo
- [ ] Both servers responding (curl Vercel URL + Render /health)
- [ ] Demo fan wallet pre-funded ($20 USDT on BSC, $20 USDC on Base)
- [ ] Streamer account registered with username `nightowl`
- [ ] OBS open with overlay browser source loaded
- [ ] Overlay pre-connected to WebSocket (load it 10 min early)
- [ ] Two screens visible: fan UI (left) + stream overlay (right)
- [ ] Test alert fired successfully in last 5 minutes

### If WebSocket is cold-started (Render free tier)
- Load the overlay URL in browser 10 minutes before demo
- The WebSocket connection will wake the server
- Send a test alert to confirm it's responsive

### Backup plan if WebSocket fails
- Have a pre-recorded video of the overlay alert
- Trigger it manually with a keyboard shortcut
- Demo the fan flow live, show the video for the overlay moment
- Explain: "In production this is real-time — here's what the streamer sees"

### Network requirements for demo
- Use mobile hotspot (4G) — venue WiFi may block WebSocket
- Have personal SIM card with data as backup
- Test on demo network the day before

---

## 9. Post-Hackathon: Custom Domain

If you win and want to launch properly:
1. Register `tipflow.app` (or `.xyz`, `.io`)
2. Add to Vercel: Settings → Domains
3. Update Magic + Particle allowed origins
4. Update all env vars
5. Point Alchemy webhook to new domain

---

## 10. Arbitrum Founder House London Application

The Arbitrum bounty page says: strong submissions encouraged to apply
for the Founder House residency (July 10-12, London).

Apply at the link on the hackathon page as soon as you submit.

Mention in your application:
- Live Arbitrum deployment URL
- Arbitrum tx hash proving real mainnet settlement
- The "Arbitrum's speed is the product feature" framing
- Your location (UK — you can actually attend)