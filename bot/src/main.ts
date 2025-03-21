import { Telegraf } from 'telegraf';
import * as dotenv from 'dotenv';
import { startCommand, helpCommand, testCommand } from './commands';

dotenv.config();

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN must be provided!');
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Register commands
bot.command('start', startCommand);
bot.command('help', helpCommand);
bot.command('test', testCommand);

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