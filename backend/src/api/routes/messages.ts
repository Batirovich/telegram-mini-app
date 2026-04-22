import { Router } from 'express'
import { Telegraf } from 'telegraf'
import { Message } from '../../db/models/Message'
import { Conversation } from '../../db/models/Conversation'
import { getSocketServer } from '../../services/socketService'

export const messagesRouter = Router()

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
