import { Context } from 'telegraf'
import fs from 'fs'
import path from 'path'
import { Conversation } from '../../db/models/Conversation'
import { Message } from '../../db/models/Message'
import { Order } from '../../db/models/Order'
import { getSocketServer } from '../../services/socketService'

const UPLOADS_DIR = path.join(__dirname, '../../../uploads')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

async function downloadTelegramFile(ctx: Context, fileId: string, ext: string): Promise<string> {
  const fileLink = await ctx.telegram.getFileLink(fileId)
  const fileName = `${fileId}.${ext}`
  const filePath = path.join(UPLOADS_DIR, fileName)

  if (!fs.existsSync(filePath)) {
    const response = await fetch(fileLink.href)
    const buffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(filePath, buffer)
  }

  return `/uploads/${fileName}`
}

async function handleConfirmationReply(ctx: Context, conversation: any, text: string) {
  const pendingOrder = await Order.findOne({
    conversationId: conversation._id,
    status: 'awaiting_confirmation'
  })
  if (!pendingOrder) return false

  const normalized = text.toLowerCase().trim()
  const isYes = normalized === 'yes' || normalized === '✅' || normalized.startsWith('yes')
  const isNo = normalized === 'no' || normalized === '❌' || normalized.startsWith('no')

  if (isYes) {
    await Order.findByIdAndUpdate(pendingOrder._id, { status: 'confirmed' })
    await ctx.reply('🎉 Order confirmed! We will process it shortly and get back to you.')
    getSocketServer()?.emit('order_updated', {
      conversationId: conversation._id.toString(),
      orderId: pendingOrder._id.toString(),
      status: 'confirmed'
    })
    return true
  }

  if (isNo) {
    await Order.findByIdAndUpdate(pendingOrder._id, { status: 'cancelled' })
    await ctx.reply('Order cancelled. Feel free to send a new order whenever you\'re ready! 🛒')
    getSocketServer()?.emit('order_updated', {
      conversationId: conversation._id.toString(),
      orderId: pendingOrder._id.toString(),
      status: 'cancelled'
    })
    return true
  }

  return false
}

export async function handleOrderMessage(ctx: Context) {
  const telegramId = ctx.from!.id
  const msg = ctx.message as any

  const conversation = await Conversation.findOne({ telegramId, status: 'active' })
  if (!conversation) {
    await ctx.reply('Please press 🛒 Start Ordering first.')
    return
  }

  // Check if this is a YES/NO response to a pending order
  if (msg.text) {
    const handled = await handleConfirmationReply(ctx, conversation, msg.text)
    if (handled) return
  }

  const messageData: Record<string, any> = {
    conversationId: conversation._id,
    telegramId,
    sender: 'client'
  }

  try {
    if (msg.text) {
      messageData.type = 'text'
      messageData.text = msg.text
    } else if (msg.photo) {
      const photo = msg.photo[msg.photo.length - 1]
      messageData.type = 'photo'
      messageData.fileUrl = await downloadTelegramFile(ctx, photo.file_id, 'jpg')
      messageData.caption = msg.caption
    } else if (msg.voice) {
      messageData.type = 'voice'
      messageData.fileUrl = await downloadTelegramFile(ctx, msg.voice.file_id, 'ogg')
      messageData.duration = msg.voice.duration
    } else if (msg.video) {
      messageData.type = 'video'
      messageData.fileUrl = await downloadTelegramFile(ctx, msg.video.file_id, 'mp4')
      messageData.caption = msg.caption
    } else if (msg.document) {
      const ext = msg.document.file_name?.split('.').pop() || 'bin'
      messageData.type = 'document'
      messageData.fileUrl = await downloadTelegramFile(ctx, msg.document.file_id, ext)
      messageData.fileName = msg.document.file_name
      messageData.mimeType = msg.document.mime_type
    } else if (msg.audio) {
      messageData.type = 'audio'
      messageData.fileUrl = await downloadTelegramFile(ctx, msg.audio.file_id, 'mp3')
      messageData.duration = msg.audio.duration
    } else {
      return
    }
  } catch (err) {
    console.error('File download error:', err)
    await ctx.reply('Sorry, could not process that file. Please try again.')
    return
  }

  const saved = await Message.create(messageData)

  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessage: messageData.text || `[${messageData.type}]`,
    lastMessageAt: new Date(),
    $inc: { unreadCount: 1 }
  })

  getSocketServer()?.emit('new_message', {
    conversationId: conversation._id.toString(),
    message: saved.toObject()
  })
}
