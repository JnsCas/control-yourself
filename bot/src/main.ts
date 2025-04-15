import * as dotenv from 'dotenv'
import { Telegraf, session } from 'telegraf'
import { helpCommand, startCommand, loginCommand } from './commands'
import {
  newExpenseCommand,
  handleAmountSelection,
  handleDateSelection,
  handleMerchantSelection,
  handleCustomAmount,
  handleCustomMerchant,
  handleCustomDate,
} from './commands/new-expense'
import { summaryCommand, handleSummarySelection, handleCustomMonth } from './commands/summary'
import logger from './utils/logger'

logger.info('Starting bot initialization...')

dotenv.config()

if (!process.env.BOT_TOKEN) {
  logger.error('BOT_TOKEN environment variable is missing')
  throw new Error('BOT_TOKEN must be provided!')
}

logger.info('BOT_TOKEN found, creating Telegraf instance...')

const bot = new Telegraf(process.env.BOT_TOKEN)

// Add session middleware
bot.use(session())
logger.info('Session middleware added')

// Register commands
bot.command('start', startCommand)
bot.command('help', helpCommand)
bot.command('new', newExpenseCommand)
bot.command('login', loginCommand)
bot.command('summary', summaryCommand)
logger.info('All commands registered')

// Callback queries for inline keyboards
bot.action(/^amount_/, handleAmountSelection)
bot.action(/^merchant_/, handleMerchantSelection)
bot.action(/^date_/, handleDateSelection)
bot.action(/^summary_/, handleSummarySelection)
logger.info('All callback handlers registered')

// Handle custom amount input
bot.hears(/^\d+(\.\d{1,2})?$/, async (ctx: any) => {
  if (!ctx.from) return
  if (ctx.session?.expenseState === 'amount') {
    await handleCustomAmount(ctx)
  }
})

// Handle custom merchant, date, and month input
bot.hears(/^.+$/, async (ctx: any) => {
  if (!ctx.from) return

  if (ctx.session?.expenseState === 'merchant') {
    await handleCustomMerchant(ctx)
  } else if (ctx.session?.expenseState === 'date') {
    await handleCustomDate(ctx)
  } else if (ctx.session?.summaryState === 'awaiting_month') {
    await handleCustomMonth(ctx)
  }
})
logger.info('All message handlers registered')

// Error handling
bot.catch((err, ctx) => {
  logger.error('Bot error occurred', {
    error: err,
    updateType: ctx.updateType,
    userId: ctx.from?.id,
    username: ctx.from?.username,
  })
  ctx.reply('Oops! Something went wrong. Please try again later.')
})

// Start bot
logger.info('Attempting to launch bot...')
bot
  .launch()
  .then(() => {
    logger.info('Bot started successfully')
    logger.info('Bot is now listening for messages')
  })
  .catch((err) => {
    logger.error('Bot launch failed', {
      error: err,
      errorMessage: err.message,
      errorStack: err.stack,
    })
  })

// Enable graceful stop
process.once('SIGINT', () => {
  logger.info('Received SIGINT signal')
  bot.stop('SIGINT')
})
process.once('SIGTERM', () => {
  logger.info('Received SIGTERM signal')
  bot.stop('SIGTERM')
})
