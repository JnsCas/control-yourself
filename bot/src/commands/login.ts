import { Context } from 'telegraf'
import { ApiClient } from '../api/api.client'
import logger from '../utils/logger'

export async function loginCommand(ctx: Context) {
  logger.info('Starting login command')

  if (!ctx.from) {
    logger.error('Login command failed: Could not identify user')
    await ctx.reply('Error: Could not identify user')
    return
  }

  const apiClient = new ApiClient()
  logger.info(`Attempting to get user with telegramId: ${ctx.from.id}`)

  const user = await apiClient.getUserByTelegramId(ctx.from.id.toString())
  if (!user) {
    logger.error(`User not found for telegramId: ${ctx.from.id}`)
    await ctx.reply('Error: User not found')
    return
  }

  if (!user.autoExpenseEnabled) {
    logger.info(`User ${ctx.from.id} needs authentication`)
    await authenticateUser(ctx, apiClient)
  } else {
    logger.info(`User ${ctx.from.id} already authenticated`)
    await ctx.reply('User already authenticated')
  }
}

async function authenticateUser(ctx: Context, apiClient: ApiClient) {
  logger.info('Starting authentication process')

  if (!ctx.from) {
    logger.error('Authentication failed: Could not identify user')
    await ctx.reply('Error: Could not identify user')
    return
  }

  try {
    const telegramId = ctx.from.id.toString()
    logger.info(`Generating auth URL for user: ${telegramId}`)
    const authUrl = await apiClient.getAuthUrl(telegramId)

    logger.info(`Auth URL generated successfully for user: ${telegramId}`)
    await ctx.reply(
      'Please authenticate with Gmail to allow me to read your transaction emails.\n' +
        'Click the link below to start:\n' +
        authUrl,
    )
  } catch (error) {
    logger.error('Failed to generate auth URL:', error)
    await ctx.reply("Sorry, I couldn't generate the authentication link. Please try again later.")
  }
}
