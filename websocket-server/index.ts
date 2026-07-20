import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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
