import { Context } from 'telegraf'
import { Order } from '../../db/models/Order'
import { Conversation } from '../../db/models/Conversation'
import { Client } from '../../db/models/Client'
import { Message } from '../../db/models/Message'
import { getSocketServer } from '../../services/socketService'

export async function handleCallbackQuery(ctx: Context) {
  const data = (ctx.callbackQuery as any)?.data as string | undefined
  if (!data) return

  await ctx.answerCbQuery()

  if (data.startsWith('ord_yes_')) {
    const orderId = data.replace('ord_yes_', '')
    await Order.findByIdAndUpdate(orderId, { status: 'confirmed' })
    const order = await Order.findById(orderId)
    await ctx.editMessageReplyMarkup(undefined)
    await ctx.reply('🎉 Order confirmed! We will start processing it shortly and keep you updated.')
    getSocketServer()?.emit('order_updated', {
      orderId, conversationId: order?.conversationId?.toString(), status: 'confirmed'
    })
    return
  }

  if (data.startsWith('ord_no_')) {
    const orderId = data.replace('ord_no_', '')
    await Order.findByIdAndUpdate(orderId, { status: 'cancelled' })
    const order = await Order.findById(orderId)
    await ctx.editMessageReplyMarkup(undefined)
    await ctx.reply('Order cancelled. No problem — send a new order whenever you\'re ready! 🛒')
    getSocketServer()?.emit('order_updated', {
      orderId, conversationId: order?.conversationId?.toString(), status: 'cancelled'
    })
    return
  }

  if (data.startsWith('ord_edit_')) {
    const orderId = data.replace('ord_edit_', '')
    const order = await Order.findById(orderId)
    if (!order) return

    // Build a readable list of current items for reference
    const currentList = order.items.map((item, i) =>
      `${i + 1}. ${item.item} × ${item.quantity}`
    ).join('\n')

    await Order.findByIdAndUpdate(orderId, { status: 'pending' })
    await ctx.editMessageReplyMarkup(undefined)
    await ctx.reply(
      `✏️ *Edit your order*\n\nCurrent items:\n${currentList}\n\n` +
      `Please send your corrected order as a text list or a photo — our team will update it for you.`,
      { parse_mode: 'Markdown' }
    )
    getSocketServer()?.emit('order_updated', {
      orderId, conversationId: order.conversationId.toString(), status: 'pending'
    })
  }
}

export async function handleWebAppData(ctx: Context) {
  const webAppData = (ctx.message as any)?.web_app_data
  if (!webAppData) return

  const telegramId = ctx.from!.id

  try {
    const parsed = JSON.parse(webAppData.data) as { items: Array<{ item: string; quantity: number; price: number }> }
    if (!parsed.items || parsed.items.length === 0) {
      await ctx.reply('No items received. Please try again.')
      return
    }

    const client = await Client.findOne({ telegramId })
    if (!client) {
      await ctx.reply('Please start the bot first with /start')
      return
    }

    let conversation = await Conversation.findOne({ telegramId, status: 'active' })
    if (!conversation) {
      conversation = await Conversation.create({ clientId: client._id, telegramId })
      await Client.findOneAndUpdate({ telegramId }, { step: 'ordering' })
    }

    const total = parsed.items.reduce((s, i) => s + i.price * i.quantity, 0)
    const order = await Order.create({
      conversationId: conversation._id,
      clientId: client._id,
      items: parsed.items,
      total,
      status: 'pending'
    })

    // Save a system message so admin sees it in chat
    const listText = parsed.items.map((i, idx) => `${idx + 1}. ${i.item} × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`).join('\n')
    const msgText = `🛒 Order from Shop:\n${listText}\n\nTotal: $${total.toFixed(2)}`
    const saved = await Message.create({
      conversationId: conversation._id,
      telegramId,
      sender: 'client',
      type: 'text',
      text: msgText
    })

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: `[Shop order] $${total.toFixed(2)}`,
      lastMessageAt: new Date(),
      $inc: { unreadCount: 1 }
    })

    getSocketServer()?.emit('new_message', {
      conversationId: conversation._id.toString(),
      message: saved.toObject()
    })

    getSocketServer()?.emit('new_order', {
      conversationId: conversation._id.toString(),
      order: order.toObject()
    })

    await ctx.reply(
      `✅ We received your shop order!\n\n${listText}\n\n💰 *Total: $${total.toFixed(2)}*\n\nOur team will review and send you a confirmation shortly.`,
      { parse_mode: 'Markdown' }
    )
  } catch (err) {
    console.error('WebApp data error:', err)
    await ctx.reply('Something went wrong processing your order. Please try again.')
  }
}
