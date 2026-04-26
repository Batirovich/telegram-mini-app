import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import { Telegraf } from 'telegraf'
import { Message } from '../../db/models/Message'
import { Conversation } from '../../db/models/Conversation'
import { Client } from '../../db/models/Client'
import { getSocketServer } from '../../services/socketService'

export const messagesRouter = Router()

const UPLOADS_DIR = path.join(__dirname, '../../../uploads')
const upload = multer({ dest: UPLOADS_DIR })

// Mini App: client sends order request (text or image) without AI
messagesRouter.post('/from-miniapp', upload.single('image'), async (req, res) => {
  try {
    const { telegramId, text } = req.body
    const imageFile = req.file

    if (!telegramId) return res.status(400).json({ error: 'telegramId required' })
    if (!text?.trim() && !imageFile) return res.status(400).json({ error: 'text or image required' })

    let conversation = await Conversation.findOne({ telegramId: Number(telegramId) })
    if (!conversation) {
      // Auto-create conversation for users who started before the fix
      const client = await Client.findOne({ telegramId: Number(telegramId) })
      if (!client) {
        if (imageFile) fs.unlink(imageFile.path, () => {})
        return res.status(404).json({ error: 'User not found. Please send /start to the bot first.' })
      }
      conversation = await Conversation.create({ clientId: client._id, telegramId: Number(telegramId), status: 'active' })
      getSocketServer()?.emit('new_conversation', conversation.toObject())
    }

    let message

    if (imageFile) {
      const ext = imageFile.originalname?.split('.').pop() || 'jpg'
      const newName = `${imageFile.filename}.${ext}`
      const newPath = path.join(UPLOADS_DIR, newName)
      fs.renameSync(imageFile.path, newPath)

      message = await Message.create({
        conversationId: conversation._id,
        telegramId: conversation.telegramId,
        sender: 'client',
        type: 'photo',
        fileUrl: `/uploads/${newName}`,
        caption: text?.trim() ? `📋 Запрос заказа: ${text.trim()}` : '📋 Запрос заказа (фото)',
      })

      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: '📷 Фото — Запрос заказа',
        lastMessageAt: new Date(),
        $inc: { unreadCount: 1 }
      })
    } else {
      message = await Message.create({
        conversationId: conversation._id,
        telegramId: conversation.telegramId,
        sender: 'client',
        type: 'text',
        text: `📋 Запрос заказа:\n${text.trim()}`
      })

      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: '📋 Запрос заказа',
        lastMessageAt: new Date(),
        $inc: { unreadCount: 1 }
      })
    }

    getSocketServer()?.emit('new_message', {
      conversationId: conversation._id.toString(),
      message: message.toObject()
    })

    res.json({ ok: true, messageId: message._id })
  } catch (err) {
    console.error('from-miniapp error:', err)
    res.status(500).json({ error: 'Failed to save message' })
  }
})

messagesRouter.get('/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

messagesRouter.post('/:conversationId/reply', async (req, res) => {
  try {
    const { text } = req.body
    if (!text?.trim()) return res.status(400).json({ error: 'text is required' })

    const conversation = await Conversation.findById(req.params.conversationId)
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' })

    const bot = new Telegraf(process.env.BOT_TOKEN!)
    await bot.telegram.sendMessage(conversation.telegramId, text)

    const message = await Message.create({
      conversationId: conversation._id,
      telegramId: conversation.telegramId,
      sender: 'admin',
      type: 'text',
      text
    })

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: text,
      lastMessageAt: new Date()
    })

    getSocketServer()?.emit('new_message', {
      conversationId: conversation._id.toString(),
      message: message.toObject()
    })

    res.json(message)
  } catch (err) {
    console.error('Reply error:', err)
    res.status(500).json({ error: 'Failed to send reply' })
  }
})
