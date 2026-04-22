import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }
}, { _id: false })

const orderSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  sourceMessageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  items: [orderItemSchema],
  total: { type: Number, default: 0 },
  // pending | awaiting_confirmation | confirmed | cancelled | processing | delivered
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
})

orderSchema.pre('save', function () {
  this.total = this.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
})

export const Order = mongoose.model('Order', orderSchema)
