import { Markup } from 'telegraf'
import { ApiClient } from '../api/api.client'
import logger from '../utils/logger'

const apiClient = new ApiClient()

// Constants for pagination
const EXPENSES_PER_PAGE = 5

export const updateExpenseCommand = async (ctx: any) => {
  logger.info('Update expense command received')

  if (!ctx.from) {
    logger.warn('No user found in context')
    return
  }

  try {
    // Get the user by Telegram ID
    const user = await apiClient.getUserByTelegramId(ctx.from.id.toString())

    if (!user) {
      logger.warn('User not found', { telegramId: ctx.from.id })
      return ctx.reply('You need to login first. Use /login to connect your account.')
    }

    // Initialize session for update expense flow
    ctx.session = {
      updateExpenseData: {
        userId: user.id,
      },
      updateExpenseState: 'selecting_month',
    }

    // Ask user which month they want to see expenses for
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // JavaScript months are 0-indexed
    const currentYear = now.getFullYear()

    // Generate keyboard for month selection
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('Current Month', `update_month_${currentMonth}_${currentYear}`),
        Markup.button.callback(
          'Last Month',
          `update_month_${currentMonth === 1 ? 12 : currentMonth - 1}_${currentMonth === 1 ? currentYear - 1 : currentYear}`,
        ),
      ],
      [Markup.button.callback('Custom Month', 'update_month_custom')],
    ])

    return ctx.reply('Which month would you like to see expenses for?', keyboard)
  } catch (error) {
    logger.error('Error starting update expense flow', { error })
    return ctx.reply('Sorry, something went wrong. Please try again later.')
  }
}

export const handleUpdateMonthSelection = async (ctx: any) => {
  if (!ctx.from) return

  // Answer the callback query to remove the loading message
  await ctx.answerCbQuery()

  const selection = ctx.callbackQuery.data.replace('update_month_', '')

  if (selection === 'custom') {
    ctx.session.updateExpenseState = 'entering_month'
    await ctx.editMessageText('Please enter the month and year (MM/YYYY format):')
    return
  }

  // Parse month and year from callback data
  const match = selection.match(/(\d+)_(\d+)/)
  if (!match) return

  const month = parseInt(match[1])
  const year = parseInt(match[2])

  ctx.session.updateExpenseData.month = month
  ctx.session.updateExpenseData.year = year

  await loadExpensesPage(ctx, month, year, 1)
}

export const handleCustomUpdateMonth = async (ctx: any) => {
  if (!ctx.from || !ctx.message || ctx.session?.updateExpenseState !== 'entering_month') return

  const text = 'text' in ctx.message ? ctx.message.text : null
  if (!text) return

  // Try to parse the month/year format
  const match = text.match(/^(\d{1,2})\/(\d{4})$/)
  if (!match) {
    return ctx.reply('Please enter a valid month and year in MM/YYYY format (e.g., 07/2024)')
  }

  const month = parseInt(match[1])
  const year = parseInt(match[2])

  if (month < 1 || month > 12) {
    return ctx.reply('Month must be between 1 and 12')
  }

  ctx.session.updateExpenseData.month = month
  ctx.session.updateExpenseData.year = year

  await loadExpensesPage(ctx, month, year, 1)
}

export const handleMerchantSearch = async (ctx: any) => {
  if (!ctx.from || !ctx.message || ctx.session?.updateExpenseState !== 'entering_merchant') return

  const text = 'text' in ctx.message ? ctx.message.text : null
  if (!text) return

  ctx.session.updateExpenseData.merchant = text

  // Get the current month and year as default
  const month = ctx.session.updateExpenseData.month
  const year = ctx.session.updateExpenseData.year

  // Load expenses filtered by merchant
  await loadExpensesPage(ctx, month, year, 1, text)
}

async function loadExpensesPage(ctx: any, month: number, year: number, page: number, merchantFilter?: string) {
  if (!ctx.session?.updateExpenseData?.userId) {
    return ctx.reply('Session expired. Please use /update_expense again.')
  }

  try {
    // Update session
    ctx.session.updateExpenseData.month = month
    ctx.session.updateExpenseData.year = year
    ctx.session.updateExpenseData.page = page

    // Get expenses for the month
    const expenses = await apiClient.getExpensesByMonth(ctx.session.updateExpenseData.userId, year, month)

    // Filter by merchant if specified
    const filteredExpenses = merchantFilter
      ? expenses.filter((e: any) => e.merchant.toLowerCase().includes(merchantFilter.toLowerCase()))
      : expenses

    if (filteredExpenses.length === 0) {
      return ctx.reply(
        merchantFilter
          ? `No expenses found for "${merchantFilter}" in ${month}/${year}. Try a different search.`
          : `No expenses found for ${month}/${year}. Try a different month.`,
      )
    }

    // Calculate pagination
    const totalPages = Math.ceil(filteredExpenses.length / EXPENSES_PER_PAGE)
    const startIndex = (page - 1) * EXPENSES_PER_PAGE
    const endIndex = Math.min(startIndex + EXPENSES_PER_PAGE, filteredExpenses.length)
    const pageExpenses = filteredExpenses.slice(startIndex, endIndex)

    // Create keyboard buttons for each expense
    const expenseButtons = pageExpenses.map((expense: any) => {
      // Format the date
      const date = new Date(expense.date)
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`

      // Format the display text
      const buttonText = `${expense.merchant} - $${expense.amount.toFixed(2)} (${formattedDate})`

      // Return button with appropriate callback data
      return [Markup.button.callback(buttonText, `update_select_${expense.id}`)]
    })

    // Add pagination buttons if needed
    const paginationButtons = []
    if (page > 1) {
      paginationButtons.push(Markup.button.callback('⬅️ Prev', `update_page_${page - 1}_${month}_${year}`))
    }
    if (page < totalPages) {
      paginationButtons.push(Markup.button.callback('Next ➡️', `update_page_${page + 1}_${month}_${year}`))
    }

    if (paginationButtons.length > 0) {
      expenseButtons.push(paginationButtons)
    }

    // Add a cancel button
    expenseButtons.push([Markup.button.callback('Cancel', 'update_cancel')])

    const keyboard = Markup.inlineKeyboard(expenseButtons)

    // Send or edit message with keyboard
    const messageText = `Expenses for ${month}/${year}${merchantFilter ? ` matching "${merchantFilter}"` : ''} (page ${page}/${totalPages}):\nSelect an expense to update:`

    if (ctx.callbackQuery) {
      await ctx.editMessageText(messageText, keyboard)
    } else {
      await ctx.reply(messageText, keyboard)
    }
  } catch (error) {
    logger.error('Error loading expenses page', { error, month, year, page })
    return ctx.reply('Sorry, something went wrong loading the expenses. Please try again.')
  }
}

export const handleExpenseSelection = async (ctx: any) => {
  if (!ctx.from) return

  // Answer the callback query to remove the loading message
  await ctx.answerCbQuery()

  const selection = ctx.callbackQuery.data.replace('update_select_', '')

  // Store selected expense ID in session
  ctx.session.updateExpenseData.selectedExpenseId = selection
  ctx.session.updateExpenseState = 'entering_installments'

  // Remove the keyboard by editing the message
  await ctx.editMessageText('Expense selected. How many installments should this expense have?')
}

export const handlePageNavigation = async (ctx: any) => {
  if (!ctx.from) return

  // Answer the callback query to remove the loading message
  await ctx.answerCbQuery()

  const selection = ctx.callbackQuery.data.replace('update_page_', '')

  // Extract page, month, year from callback data
  const match = selection.match(/(\d+)_(\d+)_(\d+)/)
  if (!match) return

  const page = parseInt(match[1])
  const month = parseInt(match[2])
  const year = parseInt(match[3])

  await loadExpensesPage(ctx, month, year, page, ctx.session.updateExpenseData.merchant)
}

export const handleCancel = async (ctx: any) => {
  if (!ctx.from) return

  // Answer the callback query to remove the loading message
  await ctx.answerCbQuery()

  // Clear session data
  ctx.session.updateExpenseState = undefined
  ctx.session.updateExpenseData = undefined

  await ctx.editMessageText('Update cancelled.')
}

export const handleInstallmentsInput = async (ctx: any) => {
  logger.info('Handle installments input', { ctx })
  if (!ctx.from || !ctx.message || ctx.session?.updateExpenseState !== 'entering_installments') return

  const text = 'text' in ctx.message ? ctx.message.text : null
  if (!text) return

  // Validate input is a positive integer of at least 2
  const installments = parseInt(text)
  if (isNaN(installments) || installments < 2) {
    return ctx.reply('Please enter a valid number for installments (minimum 2).')
  }

  if (!ctx.session.updateExpenseData.selectedExpenseId) {
    return ctx.reply('No expense selected. Please start over with /update_expense.')
  }

  try {
    // Update the expense with installments
    await apiClient.updateExpense(ctx.session.updateExpenseData.selectedExpenseId, { installmentsTotal: installments })

    // Clear session and confirm
    ctx.session.updateExpenseState = undefined
    ctx.session.updateExpenseData = undefined

    return ctx.reply(`✅ Successfully updated the expense to have ${installments} installments.`)
  } catch (error) {
    logger.error('Error updating expense installments', {
      error,
      expenseId: ctx.session.updateExpenseData.selectedExpenseId,
      installments,
    })
    return ctx.reply('Sorry, something went wrong updating the expense. Please try again.')
  }
}
