import { Telegraf } from 'telegraf'
import { handleStart, handleContact, handleRegistrationText } from './handlers/start'
import { handleOrderMessage } from './handlers/messages'
import { handleCallbackQuery, handleWebAppData } from './handlers/callbacks'
import { Client } from '../db/models/Client'

export function initBot() {
  const bot = new Telegraf(process.env.BOT_TOKEN!)

  bot.start(handleStart)
  bot.on('contact', handleContact)
  bot.on('callback_query', handleCallbackQuery)

  bot.on('message', async (ctx) => {
    const telegramId = ctx.from?.id
    if (!telegramId) return

    // Mini App data takes priority
    if ((ctx.message as any)?.web_app_data) {
      return handleWebAppData(ctx as any)
    }

    // All ordering now happens via Mini App
    return handleOrderMessage(ctx as any)
  })

  bot.catch((err) => {
    console.error('Bot error:', err)
  })

  return bot
}
