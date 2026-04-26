import { Context } from 'telegraf'
import { Client } from '../../db/models/Client'
import { Conversation } from '../../db/models/Conversation'
import { getSocketServer } from '../../services/socketService'

const MINI_APP_URL = process.env.MINI_APP_URL || ''

export async function handleStart(ctx: Context) {
  const telegramId = ctx.from!.id

  // Save basic info, mark as registered via Mini App flow
  await Client.findOneAndUpdate(
    { telegramId },
    {
      telegramId,
      firstName: ctx.from?.first_name,
      lastName: ctx.from?.last_name,
      username: ctx.from?.username,
    },
    { upsert: true, new: true }
  )

  await ctx.reply(
    `👋 Hello, ${ctx.from?.first_name}!\n\nWelcome to UGO — your construction & power tools store.\n\nTap below to browse and order.`,
    {
      reply_markup: {
        inline_keyboard: [[
          { text: '🛒 Open UGO Store', web_app: { url: MINI_APP_URL } }
        ]]
      }
    }
  )
}

// Keep contact handler for backward compat (won't be triggered in new flow)
export async function handleContact(ctx: Context) {
  const telegramId = ctx.from!.id
  const contact = (ctx.message as any).contact

  await Client.findOneAndUpdate(
    { telegramId },
    { phone: contact.phone_number, step: 'ready' }
  )

  await ctx.reply('✅ Phone saved! Open the store to start ordering.', {
    reply_markup: {
      inline_keyboard: [[
        { text: '🛒 Open Store', web_app: { url: MINI_APP_URL } }
      ]],
    }
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
  await ctx.reply('📦 Send your order — text, photos, voice, anything works.', {
    reply_markup: { remove_keyboard: true }
  })
}

export async function handleRegistrationText(ctx: Context) {
  // Legacy — not used in Mini App only flow
}
