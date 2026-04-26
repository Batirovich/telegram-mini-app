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
import { productsRouter } from './api/routes/products'
import { authRouter } from './api/routes/auth'
import { initBot } from './bot/index'
import { setSocketServer } from './services/socketService'
import { seedProductsIfEmpty } from './services/seedService'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: '*', credentials: false }
})

app.use(cors({ origin: '*' }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/api/conversations', conversationsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/products', productsRouter)
app.use('/api/auth', authRouter)

io.on('connection', (socket) => {
  console.log('Dashboard connected:', socket.id)
  socket.on('disconnect', () => console.log('Dashboard disconnected:', socket.id))
})

setSocketServer(io)

const PORT = process.env.PORT || 4000

async function main() {
  console.log('🚀 UGO Backend v2 — Mini App only flow')
  await connectDB()
  await seedProductsIfEmpty()

  const bot = initBot()
  bot.launch({ allowedUpdates: ['message', 'callback_query'], dropPendingUpdates: true })
    .catch(err => console.error('Bot launch error (non-fatal):', err.message))

  if (process.env.MINI_APP_URL) {
    await bot.telegram.setChatMenuButton({
      menuButton: {
        type: 'web_app',
        text: '🛒 Shop',
        web_app: { url: process.env.MINI_APP_URL }
      }
    })
    console.log('Mini App registered:', process.env.MINI_APP_URL)
  }

  console.log('Bot started (long polling)')
  httpServer.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`))

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

main().catch(console.error)
