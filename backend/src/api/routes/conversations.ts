import { Router } from 'express'
import { Conversation } from '../../db/models/Conversation'

export const conversationsRouter = Router()

conversationsRouter.get('/', async (_req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate('clientId')
      .sort({ lastMessageAt: -1 })
    res.json(conversations)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

conversationsRouter.get('/:id', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate('clientId')
    if (!conversation) return res.status(404).json({ error: 'Not found' })
    res.json(conversation)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation' })
  }
})

conversationsRouter.patch('/:id/read', async (req, res) => {
  try {
    await Conversation.findByIdAndUpdate(req.params.id, { unreadCount: 0 })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update' })
  }
})
