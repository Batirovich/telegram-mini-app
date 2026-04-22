import { Router } from 'express'
import path from 'path'
import { Telegraf } from 'telegraf'
import { Order } from '../../db/models/Order'
import { Message } from '../../db/models/Message'
import { Conversation } from '../../db/models/Conversation'
import { extractOrderFromText, extractOrderFromImage, OrderItem } from '../../services/aiService'
import { getSocketServer } from '../../services/socketService'

export const ordersRouter = Router()

const UPLOADS_DIR = path.join(__dirname, '../../../uploads')

// Extract items from a message using AI
ordersRouter.post('/extract', async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(400).json({ error: 'ANTHROPIC_API_KEY not configured in .env' })
    }

    const { messageId } = req.body
    const message = await Message.findById(messageId)
    if (!message) return res.status(404).json({ error: 'Message not found' })

    let items: OrderItem[] = []

    if (message.type === 'photo' && message.fileUrl) {
      const fileName = message.fileUrl.replace('/uploads/', '')
      const filePath = path.join(UPLOADS_DIR, fileName)
      items = await extractOrderFromImage(filePath)
    } else if (message.type === 'text' && message.text) {
      items = await extractOrderFromText(message.text)
    } else {
      return res.status(400).json({ error: 'Message type not supported for extraction' })
    }

    res.json({ items })
  } catch (err: any) {
    console.error('AI extraction error:', err)
    res.status(500).json({ error: err.message || 'AI extraction failed' })
  }
})

// Create an order
ordersRouter.post('/', async (req, res) => {
  try {
    const { conversationId, clientId, sourceMessageId, items } = req.body
    const total = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)
    const order = await Order.create({ conversationId, clientId, sourceMessageId, items, total })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// Get orders for a conversation
ordersRouter.get('/conversation/:conversationId', async (req, res) => {
  try {
    const orders = await Order.find({ conversationId: req.params.conversationId }).sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Update order items/status
ordersRouter.patch('/:id', async (req, res) => {
  try {
    const { items, status } = req.body
    const update: any = {}
    if (items) {
      update.items = items
      update.total = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)
    }
    if (status) update.status = status
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' })
  }
})

// Send confirmation to client
ordersRouter.post('/:id/send-confirmation', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    const conversation = await Conversation.findById(order.conversationId)
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' })

    const lines = order.items.map((item, i) =>
      `${i + 1}. ${item.item} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n')

    const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0)

    const text =
      `📋 *Order Summary*\n\n${lines}\n\n` +
      `💰 *Total: $${total.toFixed(2)}*\n\n` +
      `Please review your order and choose an option below:`

    const bot = new Telegraf(process.env.BOT_TOKEN!)
    await bot.telegram.sendMessage(conversation.telegramId, text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Confirm Order', callback_data: `ord_yes_${order._id}` },
            { text: '❌ Cancel', callback_data: `ord_no_${order._id}` }
          ],
          [
            { text: '✏️ Edit Order', callback_data: `ord_edit_${order._id}` }
          ]
        ]
      }
    })

    await Order.findByIdAndUpdate(order._id, { status: 'awaiting_confirmation', total })

    getSocketServer()?.emit('order_updated', {
      orderId: order._id.toString(),
      conversationId: order.conversationId.toString(),
      status: 'awaiting_confirmation'
    })

    res.json({ ok: true })
  } catch (err: any) {
    console.error('Send confirmation error:', err)
    res.status(500).json({ error: err.message || 'Failed to send confirmation' })
  }
})
