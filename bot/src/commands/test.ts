import { Context } from 'telegraf';
import { ApiClient } from '../api/api.client';
import logger from '../utils/logger';

export const testCommand = async (ctx: Context) => {
  if (!ctx.from) {
    logger.error('Test command called without user context');
    return;
  }

  logger.info('Test command received', {
    userId: ctx.from.id,
    username: ctx.from.username
  });

  try {
    const apiClient = new ApiClient();
    logger.info('Processing new emails for test command', { userId: ctx.from.id });
    const emails = await apiClient.processNewEmails();
    logger.info('Successfully processed emails for test command', { 
      userId: ctx.from.id,
      emailCount: Array.isArray(emails) ? emails.length : 0
    });
    await ctx.reply(JSON.stringify(emails));
  } catch (error) {
    logger.error('Error in test command', {
      userId: ctx.from.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    await ctx.reply('Sorry, there was an error processing the test command. Please try again later.');
  }
}; 