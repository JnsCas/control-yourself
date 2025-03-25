import { Telegraf, session } from 'telegraf';
import * as dotenv from 'dotenv';
import { startCommand, helpCommand, testCommand } from './commands';
import { addExpenseCommand, handleExpenseAmount, handleExpenseMerchant, handleExpenseDate } from './commands/add-expense';

dotenv.config();

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN must be provided!');
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Add session middleware
bot.use(session());

// Register commands
bot.command('start', startCommand);
bot.command('help', helpCommand);
bot.command('test', testCommand);
bot.command('new', addExpenseCommand);

// Handle expense creation flow
bot.hears(/^\d+(\.\d{1,2})?$/, async (ctx: any) => {
  if (!ctx.from) return;
  if (ctx.session?.expenseState === 'amount') {
    await handleExpenseAmount(ctx);
  }
});

bot.hears(/^.+$/, async (ctx: any) => {
  if (!ctx.from) return;
  if (ctx.session?.expenseState === 'merchant') {
    await handleExpenseMerchant(ctx);
  } else if (ctx.session?.expenseState === 'date') {
    await handleExpenseDate(ctx);
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}`, err);
  ctx.reply('Oops! Something went wrong. Please try again later.');
});

// Start bot
bot.launch()
  .then(() => console.log('Bot is running'))
  .catch((err) => console.error('Bot launch failed:', err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 