import { Router } from 'express'
import crypto from 'crypto'
import { Client } from '../../db/models/Client'
import { Order } from '../../db/models/Order'

export const authRouter = Router()

function validateTelegramData(initData: string, botToken: string): Record<string, string> | null {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return null

    params.delete('hash')

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
    const computed = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

    if (computed !== hash) return null

    const user = params.get('user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

// POST /api/auth/miniapp
authRouter.post('/miniapp', async (req, res) => {
  try {
    const { initData } = req.body

    // In development/browser, allow guest mode
    if (!initData || initData === 'guest') {
      return res.json({ guest: true, telegramId: null, firstName: 'Guest', registered: false })
    }

    const userData = validateTelegramData(initData, process.env.BOT_TOKEN!)
    if (!userData) return res.status(401).json({ error: 'Invalid Telegram data' })

    const telegramId = Number(userData.id)
    const client = await Client.findOne({ telegramId })

    const orderCount = client
      ? await Order.countDocuments({ clientId: client._id })
      : 0

    res.json({
      guest: false,
      telegramId,
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      username: userData.username || '',
      photoUrl: userData.photo_url || '',
      registered: !!client?.phone,
      accountName: client?.accountName || '',
      phone: client?.phone || '',
      orderCount
    })
  } catch (err) {
    res.status(500).json({ error: 'Auth failed' })
  }
})

// GET /api/auth/orders/:telegramId
authRouter.get('/orders/:telegramId', async (req, res) => {
  try {
    const client = await Client.findOne({ telegramId: Number(req.params.telegramId) })
    if (!client) return res.json([])

    const orders = await Order.find({ clientId: client._id })
      .sort({ createdAt: -1 })
      .limit(20)

    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})
