import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  telegramId: { type: Number, required: true },
  status: { type: String, default: 'active' }, // active | closed
  unreadCount: { type: Number, default: 0 },
  lastMessage: String,
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
})

export const Conversation = mongoose.model('Conversation', conversationSchema)
