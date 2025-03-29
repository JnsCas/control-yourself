import { Context } from 'telegraf';
import { ApiClient } from '../api/api.client';
import logger from '../utils/logger';

export const startCommand = async (ctx: Context) => {
  if (!ctx.from) {
    logger.error('Start command called without user context');
    await ctx.reply('Error: Could not identify user');
    return;
  }

  logger.info('Start command received', {
    userId: ctx.from.id,
    username: ctx.from.username,
    firstName: ctx.from.first_name
  });

  const apiClient = new ApiClient();
  
  try {
    // Create or get user
    await apiClient.createUser(
      ctx.from.id.toString(),
      ctx.from.username || ctx.from.first_name
    );

    const welcomeMessage = `
Welcome to Credit Card Expense Tracker! 💳

I'll help you track your credit card expenses. Here's what you can do:

/add-expense - Add a new expense manually
/setup-auto - Set up automatic expense tracking from your Gmail
/expenses - View your expenses by month

Use /help to see all available commands.
    `;

    await ctx.reply(welcomeMessage);
    logger.info('Successfully completed start command', { userId: ctx.from.id });
  } catch (error) {
    logger.error('Error in start command', {
      userId: ctx.from.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    await ctx.reply('Sorry, there was an error setting up your account. Please try again later.');
  }
}; 