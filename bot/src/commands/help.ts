import { Context } from 'telegraf'
import logger from '../utils/logger'

export const helpCommand = async (ctx: Context) => {
  if (!ctx.from) {
    logger.error('Help command called without user context')
    return
  }

  logger.info('Help command received', {
    userId: ctx.from.id,
    username: ctx.from.username,
  })

  try {
    const helpMessage = `
Available commands:
/start - Start the bot
/help - Show this help message
/new - Create a new expense
/summary - View monthly expense summaries
/update_expense - Update an expense to add installments
/login - Connect your account
  `
    await ctx.reply(helpMessage)
    logger.info('Successfully sent help message', { userId: ctx.from.id })
  } catch (error) {
    logger.error('Error in help command', {
      userId: ctx.from.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    await ctx.reply('Sorry, there was an error showing the help message. Please try again later.')
  }
}
