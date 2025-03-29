import * as dotenv from 'dotenv';
import { Telegraf, session } from 'telegraf';
import { helpCommand, startCommand, testCommand } from './commands';
import { newExpenseCommand, handleAmountSelection, handleDateSelection, handleMerchantSelection, handleCustomAmount, handleCustomMerchant, handleCustomDate } from './commands/new-expense';
import { summaryCommand, handleSummarySelection, handleCustomMonth } from './commands/summary';

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
bot.command('new', newExpenseCommand);
bot.command('summary', summaryCommand);

// Callback queries for inline keyboards
bot.action(/^amount_/, handleAmountSelection);
bot.action(/^merchant_/, handleMerchantSelection);
bot.action(/^date_/, handleDateSelection);
bot.action(/^summary_/, handleSummarySelection);

// Handle custom amount input
bot.hears(/^\d+(\.\d{1,2})?$/, async (ctx: any) => {
  if (!ctx.from) return;
  if (ctx.session?.expenseState === 'amount') {
    await handleCustomAmount(ctx);
  }
});

// Handle custom merchant, date, and month input
bot.hears(/^.+$/, async (ctx: any) => {
  if (!ctx.from) return;
  
  if (ctx.session?.expenseState === 'merchant') {
    await handleCustomMerchant(ctx);
  } else if (ctx.session?.expenseState === 'date') {
    await handleCustomDate(ctx);
  } else if (ctx.session?.summaryState === 'awaiting_month') {
    await handleCustomMonth(ctx);
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