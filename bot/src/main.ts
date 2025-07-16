import * as dotenv from 'dotenv'
import { Telegraf, session } from 'telegraf'
import * as help from './commands/help'
import * as start from './commands/start'
import * as login from './commands/login'
import * as newExpense from './commands/new-expense'
import * as summaryCommand from './commands/summary'
import * as updateExpense from './commands/update-expense'
import { authErrorMiddleware } from './middleware/auth-error.middleware'
import logger from './utils/logger'

logger.info('Starting bot initialization...')

dotenv.config()

if (!process.env.BOT_TOKEN) {
  logger.error('BOT_TOKEN environment variable is missing')
  throw new Error('BOT_TOKEN must be provided!')
}

logger.info('BOT_TOKEN found, creating Telegraf instance...')

const bot = new Telegraf(process.env.BOT_TOKEN)

// Add session middleware with better persistence
bot.use(
  session({
    getSessionKey: (ctx) => {
      if (ctx.from) {
        return `user:${ctx.from.id}`
      }
      return undefined
    },
  }),
)
logger.info('Session middleware added with enhanced configuration')

bot.use(authErrorMiddleware)
logger.info('Auth error middleware added')

// Register commands
bot.command('start', start.startCommand)
bot.command('help', help.helpCommand)
bot.command('new', newExpense.newExpenseCommand)
bot.command('login', login.loginCommand)
bot.command('summary', summaryCommand.summaryCommand)
bot.command('update_expense', updateExpense.updateExpenseCommand)
logger.info('All commands registered')

// Callback queries for inline keyboards
bot.action(/^amount_/, newExpense.handleAmountSelection)
bot.action(/^merchant_/, newExpense.handleMerchantSelection)
bot.action(/^date_/, newExpense.handleDateSelection)
bot.action(/^summary_/, summaryCommand.handleSummarySelection)
bot.action(/^update_month_/, updateExpense.handleUpdateMonthSelection)
bot.action(/^update_select_/, updateExpense.handleExpenseSelection)
bot.action(/^update_page_/, updateExpense.handlePageNavigation)
bot.action('update_cancel', updateExpense.handleCancel)
logger.info('All callback handlers registered')

// Handle custom amount input
bot.hears(/^\d+(\.\d{1,2})?$/, async (ctx: any) => {
  if (!ctx.from) return
  if (ctx.session?.expenseState === 'amount') {
    await newExpense.handleCustomAmount(ctx)
  } else if (ctx.session?.updateExpenseState === 'entering_installments') {
    await updateExpense.handleInstallmentsInput(ctx)
  }
})

// Handle custom merchant, date, and month input
bot.hears(/^.+$/, async (ctx: any) => {
  if (!ctx.from) return

  if (ctx.session?.expenseState === 'merchant') {
    await newExpense.handleCustomMerchant(ctx)
  } else if (ctx.session?.expenseState === 'date') {
    await newExpense.handleCustomDate(ctx)
  } else if (ctx.session?.summaryState === 'awaiting_month') {
    await summaryCommand.handleCustomMonth(ctx)
  } else if (ctx.session?.updateExpenseState === 'entering_month') {
    await updateExpense.handleCustomUpdateMonth(ctx)
  } else if (ctx.session?.updateExpenseState === 'entering_installments') {
    await updateExpense.handleInstallmentsInput(ctx)
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
