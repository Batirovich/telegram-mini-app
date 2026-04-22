import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  telegramId: Number,
  sender: { type: String, enum: ['client', 'admin'], required: true },
  type: {
    type: String,
    enum: ['text', 'photo', 'voice', 'video', 'document', 'audio', 'sticker'],
    default: 'text'
  },
  text: String,
  caption: String,
  fileUrl: String,
  fileName: String,
  mimeType: String,
  duration: Number,
  createdAt: { type: Date, default: Date.now }
})

export const Message = mongoose.model('Message', messageSchema)
