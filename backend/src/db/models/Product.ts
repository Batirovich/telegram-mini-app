import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, default: '' },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  emoji: { type: String, default: '📦' },
  bg: { type: String, default: '#3b82f622' },
  color: { type: String, default: '#3b82f6' },
  stock: { type: Number, default: 999 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
})

productSchema.index({ name: 'text', brand: 'text', description: 'text' })

export const Product = mongoose.model('Product', productSchema)
