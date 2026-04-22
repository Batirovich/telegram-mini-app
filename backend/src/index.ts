import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import path from 'path'
import { connectDB } from './db/connection'
import { conversationsRouter } from './api/routes/conversations'
import { messagesRouter } from './api/routes/messages'
import { ordersRouter } from './api/routes/orders'
import { featuredRouter } from './api/routes/featured'
import { initBot } from './bot/index'
import { setSocketServer } from './services/socketService'

const app = express()
const httpServer = createServer(app)

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.DASHBOARD_URL,   // e.g. https://your-site.netlify.app
  process.env.MINI_APP_URL,    // e.g. https://your-site.netlify.app/miniapp
].filter(Boolean) as string[]

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, credentials: true }
})

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/api/conversations', conversationsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/featured', featuredRouter)

io.on('connection', (socket) => {
  console.log('Dashboard connected:', socket.id)
  socket.on('disconnect', () => console.log('Dashboard disconnected:', socket.id))
})

setSocketServer(io)

const PORT = process.env.PORT || 4000

async function main() {
  await connectDB()

  const bot = initBot()
  bot.launch({ allowedUpdates: ['message', 'callback_query'] })

  if (process.env.MINI_APP_URL) {
    await bot.telegram.setChatMenuButton({
      menuButton: {
        type: 'web_app',
        text: '🛒 Shop',
        web_app: { url: process.env.MINI_APP_URL }
      }
    })
    console.log('Mini App menu button registered:', process.env.MINI_APP_URL)
  }
  console.log('Bot started (long polling)')

  httpServer.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`)
  })

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

main().catch(console.error)
