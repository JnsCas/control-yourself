import { Context } from 'telegraf';
import { ApiClient } from '../api/api.client';

export const startCommand = async (ctx: Context) => {
  if (!ctx.from) {
    await ctx.reply('Error: Could not identify user');
    return;
  }

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
  } catch (error) {
    console.error('Error in start command:', error);
    await ctx.reply('Sorry, there was an error setting up your account. Please try again later.');
  }
}; 