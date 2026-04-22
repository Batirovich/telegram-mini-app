import mongoose from 'mongoose'

const clientSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  username: String,
  firstName: String,
  lastName: String,
  phone: String,
  accountName: String,
  // awaiting_contact | awaiting_account | ready | ordering
  step: { type: String, default: 'awaiting_contact' },
  createdAt: { type: Date, default: Date.now }
})

export const Client = mongoose.model('Client', clientSchema)
