import { Markup } from 'telegraf'
import { ApiClient } from '../api/api.client'
import { ExpenseCurrency, ExpenseSource } from '../types/expense.types'
import logger from '../utils/logger'

export const newExpenseCommand = async (ctx: any) => {
  if (!ctx.from) {
    logger.error('New expense command called without user context')
    await ctx.reply('Error: Could not identify user')
    return
  }

  logger.info('New expense command received', {
    userId: ctx.from.id,
    username: ctx.from.username,
  })

  // Initialize session state
  ctx.session = { expenseData: {}, expenseState: 'amount' }

  // Create inline keyboard with common amounts
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('$10k', 'amount_10000'),
      Markup.button.callback('$20k', 'amount_20000'),
      Markup.button.callback('$50k', 'amount_50000'),
    ],
    [
      Markup.button.callback('$100k', 'amount_100000'),
      Markup.button.callback('$200k', 'amount_200000'),
      Markup.button.callback('$500k', 'amount_500000'),
    ],
    [Markup.button.callback('Custom Amount', 'amount_custom')],
  ])

  await ctx.reply('Select an amount or enter a custom one:', keyboard)
  logger.info('Sent amount selection keyboard', { userId: ctx.from.id })
}

export const handleAmountSelection = async (ctx: any) => {
  if (!ctx.from) {
    logger.error('Amount selection handler called without user context')
    return
  }

  // Answer the callback query to remove the loading message
  await ctx.answerCbQuery()

  const amount = ctx.callbackQuery.data.replace('amount_', '')
  logger.info('Amount selection received', {
    userId: ctx.from.id,
    amount,
    isCustom: amount === 'custom',
  })

  if (amount === 'custom') {
    await ctx.reply('Please enter the amount:', Markup.forceReply())
    return
  }

  ctx.session.expenseData.amount = parseFloat(amount)
  await showMerchantSelection(ctx)
}

export const handleCustomAmount = async (ctx: any) => {
  if (!ctx.from || !ctx.message || !('text' in ctx.message)) {
    logger.error('Custom amount handler called with invalid context', {
      userId: ctx.from?.id,
      hasMessage: !!ctx.message,
      hasText: ctx.message && 'text' in ctx.message,
    })
    await ctx.reply('Error: Invalid input')
    return
  }

  const amount = parseFloat(ctx.message.text)
  logger.info('Custom amount received', {
    userId: ctx.from.id,
    amount,
  })

  if (isNaN(amount) || amount <= 0) {
    logger.warn('Invalid amount received', {
      userId: ctx.from.id,
      amount: ctx.message.text,
    })
    await ctx.reply('Please enter a valid amount (greater than 0):', Markup.forceReply())
    return
  }

  ctx.session.expenseData.amount = amount
  await showMerchantSelection(ctx)
}

async function showMerchantSelection(ctx: any) {
  if (!ctx.from) return

  // Set state to merchant before showing merchant selection
  ctx.session.expenseState = 'merchant'

  // Create inline keyboard with common merchants
  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('Supermercado', 'merchant_supermercado'),
      Markup.button.callback('Gasoil', 'merchant_gasoil'),
      Markup.button.callback('Comida', 'merchant_comida'),
    ],
    [Markup.button.callback('Custom Merchant', 'merchant_custom')],
  ])

  await ctx.reply('Select a merchant or enter a custom one:', keyboard)
  logger.info('Sent merchant selection keyboard', {
    userId: ctx.from.id,
    amount: ctx.session.expenseData.amount,
  })
}

export const handleMerchantSelection = async (ctx: any) => {
  if (!ctx.from) {
    logger.error('Merchant selection handler called without user context')
    return
  }

  // Answer the callback query to remove the loading message
  await ctx.answerCbQuery()

  const merchant = ctx.callbackQuery.data.replace('merchant_', '')
  logger.info('Merchant selection received', {
    userId: ctx.from.id,
    merchant,
    isCustom: merchant === 'custom',
  })

  if (merchant === 'custom') {
    await ctx.reply('Please enter the merchant name:', Markup.forceReply())
    return
  }

  ctx.session.expenseData.merchant = merchant
  await showDateSelection(ctx)
}

export const handleCustomMerchant = async (ctx: any) => {
  if (!ctx.from || !ctx.message || !('text' in ctx.message)) {
    logger.error('Custom merchant handler called with invalid context', {
      userId: ctx.from?.id,
      hasMessage: !!ctx.message,
      hasText: ctx.message && 'text' in ctx.message,
    })
    await ctx.reply('Error: Invalid input')
    return
  }

  logger.info('Custom merchant received', {
    userId: ctx.from.id,
    merchant: ctx.message.text,
  })

  ctx.session.expenseData.merchant = ctx.message.text
  await showDateSelection(ctx)
}

async function showDateSelection(ctx: any) {
  if (!ctx.from) return

  // Set state to date before showing date selection
  ctx.session.expenseState = 'date'

  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Today', 'date_today'), Markup.button.callback('Yesterday', 'date_yesterday')],
    [Markup.button.callback('Custom Date', 'date_custom')],
  ])

  await ctx.reply('Select a date or enter a custom one (DD-MM-YYYY):', keyboard)
  logger.info('Sent date selection keyboard', {
    userId: ctx.from.id,
    amount: ctx.session.expenseData.amount,
    merchant: ctx.session.expenseData.merchant,
  })
}

export const handleDateSelection = async (ctx: any) => {
  if (!ctx.from) {
    logger.error('Date selection handler called without user context')
    return
  }

  // Answer the callback query to remove the loading message
  await ctx.answerCbQuery()

  const dateSelection = ctx.callbackQuery.data.replace('date_', '')
  logger.info('Date selection received', {
    userId: ctx.from.id,
    selection: dateSelection,
    isCustom: dateSelection === 'custom',
  })

  if (dateSelection === 'custom') {
    await ctx.reply('Please enter the date (DD-MM-YYYY):', Markup.forceReply())
    return
  }

  let date: Date
  switch (dateSelection) {
    case 'today':
      date = new Date()
      break
    case 'yesterday':
      date = new Date()
      date.setDate(date.getDate() - 1)
      break
    default:
      logger.warn('Invalid date selection received', {
        userId: ctx.from.id,
        selection: dateSelection,
      })
      await ctx.reply('Invalid date selection')
      return
  }

  ctx.session.expenseData.date = date
  await showInstallmentsSelection(ctx)
}

export const handleCustomDate = async (ctx: any) => {
  if (!ctx.from || !ctx.message || !('text' in ctx.message)) {
    logger.error('Custom date handler called with invalid context', {
      userId: ctx.from?.id,
      hasMessage: !!ctx.message,
      hasText: ctx.message && 'text' in ctx.message,
    })
    await ctx.reply('Error: Invalid input')
    return
  }

  // Parse DD-MM-YYYY format
  const [day, month, year] = ctx.message.text.split('-').map(Number)
  logger.info('Custom date received', {
    userId: ctx.from.id,
    dateString: ctx.message.text,
  })

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    logger.warn('Invalid date format received', {
      userId: ctx.from.id,
      dateString: ctx.message.text,
    })
    await ctx.reply('Please enter a valid date (DD-MM-YYYY):', Markup.forceReply())
    return
  }

  // Create date object (month is 0-based in JavaScript Date)
  const date = new Date(year, month - 1, day)

  // Validate date components
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    logger.warn('Invalid date components received', {
      userId: ctx.from.id,
      dateString: ctx.message.text,
      parsedDate: date.toISOString(),
    })
    // Maintain the session state when asking for retry
    ctx.session.expenseState = 'date'
    await ctx.reply('Please enter a valid date (DD-MM-YYYY):', Markup.forceReply())
    return
  }

  ctx.session.expenseData.date = date
  await showInstallmentsSelection(ctx)
}

async function showInstallmentsSelection(ctx: any) {
  if (!ctx.from) return

  // Set state to installments before showing installments selection
  ctx.session.expenseState = 'installments'

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.callback('1x (Single Payment)', 'installments_1'),
      Markup.button.callback('3x', 'installments_3'),
      Markup.button.callback('6x', 'installments_6'),
    ],
    [
      Markup.button.callback('12x', 'installments_12'),
      Markup.button.callback('18x', 'installments_18'),
      Markup.button.callback('24x', 'installments_24'),
    ],
    [Markup.button.callback('Custom Installments', 'installments_custom')],
  ])

  await ctx.reply('Select number of installments:', keyboard)
  logger.info('Sent installments selection keyboard', {
    userId: ctx.from.id,
    amount: ctx.session.expenseData.amount,
    merchant: ctx.session.expenseData.merchant,
    date: ctx.session.expenseData.date,
  })
}

export const handleInstallmentsSelection = async (ctx: any) => {
  if (!ctx.from) {
    logger.error('Installments selection handler called without user context')
    return
  }

  // Answer the callback query to remove the loading message
  await ctx.answerCbQuery()

  const installments = ctx.callbackQuery.data.replace('installments_', '')
  logger.info('Installments selection received', {
    userId: ctx.from.id,
    installments,
    isCustom: installments === 'custom',
  })

  if (installments === 'custom') {
    await ctx.reply('Please enter the number of installments (2 or more):', Markup.forceReply())
    return
  }

  const installmentsNumber = parseInt(installments)
  if (installmentsNumber === 1) {
    // Single payment, no installments needed
    ctx.session.expenseData.installmentsTotal = undefined
  } else {
    ctx.session.expenseData.installmentsTotal = installmentsNumber
  }

  await saveExpense(ctx)
}

export const handleCustomInstallments = async (ctx: any) => {
  if (!ctx.from || !ctx.message) {
    logger.error('Custom installments handler called with invalid context', {
      userId: ctx.from?.id,
      hasMessage: !!ctx.message,
      hasText: ctx.message && 'text' in ctx.message,
    })
    await ctx.reply('Error: Invalid input')
    return
  }

  const installments = parseInt(ctx.message.text)
  logger.info('Custom installments received', {
    userId: ctx.from.id,
    installments,
  })

  if (isNaN(installments) || installments < 2) {
    logger.warn('Invalid installments received', {
      userId: ctx.from.id,
      installments: ctx.message.text,
    })
    // Maintain the session state when asking for retry
    ctx.session.expenseState = 'installments'
    await ctx.reply('Please enter a valid number of installments (2 or more):', Markup.forceReply())
    return
  }

  ctx.session.expenseData.installmentsTotal = installments
  await saveExpense(ctx)
}

async function saveExpense(ctx: any) {
  if (!ctx.from) {
    logger.error('Save expense called without user context')
    return
  }

  try {
    const apiClient = new ApiClient()

    //FIXME move this to the server side
    const user = await apiClient.getUserByTelegramId(ctx.from.id.toString())
    if (!user) {
      logger.error('User not found', { telegramId: ctx.from.id })
      await ctx.reply('Error: User not found')
      return
    }

    logger.info('Attempting to save expense', {
      userId: user.id,
      amount: ctx.session.expenseData.amount,
      merchant: ctx.session.expenseData.merchant,
      date: ctx.session.expenseData.date,
      installmentsTotal: ctx.session.expenseData.installmentsTotal,
    })

    await apiClient.createExpense({
      userId: user.id,
      amount: ctx.session.expenseData.amount,
      merchant: ctx.session.expenseData.merchant,
      date: ctx.session.expenseData.date,
      source: ExpenseSource.TELEGRAM,
      currency: ExpenseCurrency.ARS,
      installmentsTotal: ctx.session.expenseData.installmentsTotal,
    })

    // Format date as DD-MM-YYYY
    const date = ctx.session.expenseData.date
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`

    // Build success message
    let successMessage =
      `Expense added successfully! 🎉\n` +
      `Amount: $${ctx.session.expenseData.amount}\n` +
      `Merchant: ${ctx.session.expenseData.merchant}\n` +
      `Date: ${formattedDate}`

    if (ctx.session.expenseData.installmentsTotal) {
      successMessage += `\nInstallments: ${ctx.session.expenseData.installmentsTotal}x`
    }

    await ctx.reply(successMessage)

    logger.info('Expense saved successfully', {
      userId: user.id,
      amount: ctx.session.expenseData.amount,
      merchant: ctx.session.expenseData.merchant,
      date: formattedDate,
      installmentsTotal: ctx.session.expenseData.installmentsTotal,
    })
  } catch (error) {
    logger.error('Error saving expense', {
      telegramId: ctx.from.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      expenseData: ctx.session.expenseData,
    })
    await ctx.reply('Sorry, there was an error adding your expense. Please try again later.')
  } finally {
    // Clear session state
    ctx.session.expenseState = undefined
    ctx.session.expenseData = undefined
    logger.info('Expense session cleared', { telegramId: ctx.from.id })
  }
}
