import { ApiClient } from '../api/api.client';

export const addExpenseCommand = async (ctx: any) => {
  if (!ctx.from) {
    await ctx.reply('Error: Could not identify user');
    return;
  }

  // Initialize session state
  ctx.session = { expenseState: 'amount', expenseData: {} };

  await ctx.reply('Please enter the amount:');
};

export const handleExpenseAmount = async (ctx: any) => {
  if (!ctx.from || !ctx.message || !('text' in ctx.message)) {
    await ctx.reply('Error: Invalid input');
    return;
  }

  const amount = parseFloat(ctx.message.text);
  if (isNaN(amount) || amount <= 0) {
    await ctx.reply('Please enter a valid amount (greater than 0):');
    return;
  }

  ctx.session.expenseData.amount = amount;
  ctx.session.expenseState = 'merchant';
  await ctx.reply('Please enter the merchant name:');
};

export const handleExpenseMerchant = async (ctx: any) => {
  if (!ctx.from || !ctx.message || !('text' in ctx.message)) {
    await ctx.reply('Error: Invalid input');
    return;
  }

  ctx.session.expenseData.merchant = ctx.message.text;
  ctx.session.expenseState = 'date';
  await ctx.reply('Please enter the date (YYYY-MM-DD) or press enter for today:');
};

export const handleExpenseDate = async (ctx: any) => {
  if (!ctx.from || !ctx.message || !('text' in ctx.message)) {
    await ctx.reply('Error: Invalid input');
    return;
  }

  let date: Date;
  if (ctx.message.text.trim() === '') {
    date = new Date();
  } else {
    date = new Date(ctx.message.text);
    if (isNaN(date.getTime())) {
      await ctx.reply('Please enter a valid date (YYYY-MM-DD) or press enter for today:');
      return;
    }
  }

  ctx.session.expenseData.date = date;

  try {
    const apiClient = new ApiClient();
    await apiClient.createExpense({
      userId: ctx.from.id.toString(),
      amount: ctx.session.expenseData.amount,
      merchant: ctx.session.expenseData.merchant,
      date: ctx.session.expenseData.date,
      type: 'MANUAL'
    });

    await ctx.reply(
      `Expense added successfully! 🎉\n` +
      `Amount: $${ctx.session.expenseData.amount}\n` +
      `Merchant: ${ctx.session.expenseData.merchant}\n` +
      `Date: ${ctx.session.expenseData.date.toLocaleDateString()}`
    );
  } catch (error) {
    console.error('Error creating expense:', error);
    await ctx.reply('Sorry, there was an error adding your expense. Please try again later.');
  } finally {
    // Clear session state
    ctx.session.expenseState = undefined;
    ctx.session.expenseData = undefined;
  }
}; 