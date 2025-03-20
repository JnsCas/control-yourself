import { Context } from 'telegraf';

export const helpCommand = async (ctx: Context) => {
  const helpMessage = `
Available commands:
/start - Start the bot
/help - Show this help message
/latest - Show recent transactions
/stats - Show monthly statistics
/settings - Configure your preferences
  `;
  await ctx.reply(helpMessage);
}; 