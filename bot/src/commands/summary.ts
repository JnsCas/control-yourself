import { Markup } from 'telegraf';
import { ApiClient } from '../api/api.client';

export const summaryCommand = async (ctx: any) => {
  if (!ctx.from) {
    await ctx.reply('Error: Could not identify user');
    return;
  }

  ctx.session = {};

  // Show month selection keyboard
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('Current Month', 'summary_current'),
      Markup.button.callback('Last Month', 'summary_last'),
    ],
    [Markup.button.callback('Custom Month', 'summary_custom')],
  ]);

  await ctx.reply(
    'Select a month to view expenses summary:',
    keyboard
  );
};

export const handleSummarySelection = async (ctx: any) => {
  if (!ctx.from) return;

  // Answer the callback query to remove the loading message
  await ctx.answerCbQuery();

  const selection = ctx.callbackQuery.data.replace('summary_', '');

  let date = new Date();
  switch (selection) {
    case 'current':
      // Keep current month
      break;
    case 'last':
      // Set to last month
      date.setMonth(date.getMonth() - 1);
      break;
    case 'custom':
      ctx.session.summaryState = 'awaiting_month';
      await ctx.reply(
        'Please enter month and year (MM-YYYY):',
        Markup.forceReply()
      );
      return;
    default:
      await ctx.reply('Invalid selection');
      return;
  }

  await showSummary(ctx, date);
};

export const handleCustomMonth = async (ctx: any) => {
  if (!ctx.from || !ctx.message || !('text' in ctx.message)) {
    await ctx.reply('Error: Invalid input');
    return;
  }

  // Parse MM-YYYY format
  const [month, year] = ctx.message.text.split('-').map(Number);
  
  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    await ctx.reply('Please enter a valid month and year (MM-YYYY):', Markup.forceReply());
    return;
  }

  const date = new Date(year, month - 1);
  await showSummary(ctx, date);
};

async function showSummary(ctx: any, date: Date) {
  try {
    const apiClient = new ApiClient();
    const expenses = await apiClient.getExpensesByMonth(ctx.from.id.toString(), date.getFullYear(), date.getMonth() + 1);

    if (!expenses || expenses.length === 0) {
      await ctx.reply(`No expenses found for ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`);
      return;
    }

    // Calculate total
    const total = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);

    // Group expenses by merchant
    const byMerchant: { [key: string]: number } = {};
    expenses.forEach((expense: any) => {
      byMerchant[expense.merchant] = (byMerchant[expense.merchant] || 0) + expense.amount;
    });

    // Create summary message
    let message = `📊 Expenses Summary for ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}\n\n`;
    message += `Total: $${total}\n\n`;
    message += `Breakdown by merchant:\n`;
    
    Object.entries(byMerchant)
      .sort((a, b) => b[1] - a[1]) // Sort by amount descending
      .forEach(([merchant, amount]) => {
        const percentage = ((amount / total) * 100).toFixed(1);
        message += `${merchant}: $${amount} (${percentage}%)\n`;
      });

    await ctx.reply(message);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    await ctx.reply('Sorry, there was an error fetching your expenses. Please try again later.');
  } finally {
    // Clear session state
    ctx.session.summaryState = undefined;
  }
} 