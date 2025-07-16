import { Context, MiddlewareFn } from 'telegraf'
import { ApiClient } from '../api/api.client'
import logger from '../utils/logger'

export const authErrorMiddleware: MiddlewareFn<Context> = async (ctx, next) => {
  try {
    await next()
  } catch (error: any) {
    if (error?.response?.status === 401 && error?.response?.data?.code === 'GMAIL_AUTH_REQUIRED') {
      logger.warn('Gmail authentication error detected, redirecting to login', {
        userId: ctx.from?.id,
        error: error.response.data,
      })

      const apiClient = new ApiClient()

      try {
        const telegramId = ctx.from?.id.toString()
        if (!telegramId) {
          await ctx.reply('Error: Could not identify user')
          return
        }

        const authUrl = await apiClient.getAuthUrl(telegramId)

        await ctx.reply(
          '🔐 Your Gmail authentication has expired or is invalid.\n\n' +
            'Please re-authenticate with Gmail to continue using automatic expense tracking:\n\n' +
            authUrl +
            '\n\n' +
            'After authentication, you can return to the bot and try your command again.',
        )
      } catch (authError) {
        logger.error('Failed to generate auth URL in error middleware', { authError })
        await ctx.reply('🔐 Your Gmail authentication has expired. Please use /login to re-authenticate.')
      }
    } else {
      throw error
    }
  }
}
