import { Context } from 'telegraf';

export const startCommand = async (ctx: Context) => {
  await ctx.reply('Welcome to Credit Card Expense Tracker! 💳\nUse /help to see available commands.');
}; 