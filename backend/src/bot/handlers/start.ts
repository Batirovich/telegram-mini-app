import { Context } from 'telegraf'
import { Client } from '../../db/models/Client'
import { Conversation } from '../../db/models/Conversation'
import { getSocketServer } from '../../services/socketService'

export async function handleStart(ctx: Context) {
  const telegramId = ctx.from!.id

  await Client.findOneAndUpdate(
    { telegramId },
    {
      telegramId,
      firstName: ctx.from?.first_name,
      lastName: ctx.from?.last_name,
      username: ctx.from?.username,
      step: 'awaiting_contact'
    },
    { upsert: true, new: true }
  )

  await ctx.reply(
    `👋 Welcome! To get started, please share your phone number so we can identify you.`,
    {
      reply_markup: {
        keyboard: [[{ text: '📞 Share My Contact', request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    }
  )
}

export async function handleContact(ctx: Context) {
  const telegramId = ctx.from!.id
  const contact = (ctx.message as any).contact

  await Client.findOneAndUpdate(
    { telegramId },
    {
      phone: contact.phone_number,
      firstName: contact.first_name || ctx.from?.first_name,
      step: 'awaiting_account'
    }
  )

  await ctx.reply('Thanks! Now please enter your account or company name:', {
    reply_markup: { remove_keyboard: true }
  })
}

export async function handleStartOrdering(ctx: Context) {
  const telegramId = ctx.from!.id
  const client = await Client.findOne({ telegramId })
  if (!client) return

  let conversation = await Conversation.findOne({ telegramId, status: 'active' })

  if (!conversation) {
    conversation = await Conversation.create({ clientId: client._id, telegramId })

    getSocketServer()?.emit('new_conversation', {
      _id: conversation._id,
      clientName: client.accountName || client.firstName || 'Unknown',
      telegramId,
      createdAt: conversation.createdAt
    })
  }

  await Client.findOneAndUpdate({ telegramId }, { step: 'ordering' })

  await ctx.reply(
    '📦 Go ahead and send your order!\n\nYou can send text, photos, voice messages, documents — anything works.',
    { reply_markup: { remove_keyboard: true } }
  )
}

export async function handleRegistrationText(ctx: Context) {
  const telegramId = ctx.from!.id
  const text = (ctx.message as any)?.text
  if (!text) return

  const client = await Client.findOne({ telegramId })
  if (!client) return

  if (client.step === 'awaiting_account') {
    await Client.findOneAndUpdate({ telegramId }, { accountName: text, step: 'ready' })

    await ctx.reply(
      `✅ Perfect, ${text}! You're registered.\n\nWhen you're ready to place an order, tap the button below.`,
      {
        reply_markup: {
          keyboard: [[{ text: '🛒 Start Ordering' }]],
          resize_keyboard: true
        }
      }
    )
    return
  }

  if (client.step === 'ready' && text === '🛒 Start Ordering') {
    return handleStartOrdering(ctx)
  }

  if (client.step === 'ready') {
    await ctx.reply('Press 🛒 Start Ordering to begin your order.')
  }
}
