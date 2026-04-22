import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-dashboard'
  await mongoose.connect(uri)
  console.log('MongoDB connected')
}
