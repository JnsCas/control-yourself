import { Markup } from 'telegraf'
import { ApiClient } from '../api/api.client'
import logger from '../utils/logger'

export const summaryCommand = async (ctx: any) => {
  if (!ctx.from) {
    logger.error('Summary command called without user context')
    await ctx.reply('Error: Could not identify user')
    return
  }

  logger.info('Summary command received', {
    userId: ctx.from.id,
    username: ctx.from.username,
  })

  ctx.session = {}

  // Show month selection keyboard
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback('Current Month', 'summary_current'), Markup.button.callback('Last Month', 'summary_last')],
    [Markup.button.callback('Custom Month', 'summary_custom')],
  ])

  await ctx.reply('Select a month to view expenses summary:', keyboard)
  logger.info('Sent month selection keyboard', { userId: ctx.from.id })
}

export const handleSummarySelection = async (ctx: any) => {
  if (!ctx.from) {
    logger.error('Summary selection handler called without user context')
    return
  }

  // Answer the callback query to remove the loading message
  await ctx.answerCbQuery()

  const selection = ctx.callbackQuery.data.replace('summary_', '')
  logger.info('Summary selection received', {
    userId: ctx.from.id,
    selection,
  })

  let date: Date
  const now = new Date()

  switch (selection) {
    case 'current':
      date = now
      break
    case 'last':
      date = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      break
    case 'custom':
      ctx.session.summaryState = 'awaiting_month'
      await ctx.reply('Please enter month and year (MM-YYYY):', Markup.forceReply())
      logger.info('Requested custom month input', { userId: ctx.from.id })
      return
    default:
      logger.warn('Invalid summary selection received', {
        userId: ctx.from.id,
        selection,
      })
      await ctx.reply('Invalid selection')
      return
  }

  logger.info('Selected date for summary', {
    userId: ctx.from.id,
    selection,
    date: date.toISOString(),
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  })

  await showSummary(ctx, date)
}

export const handleCustomMonth = async (ctx: any) => {
  if (!ctx.from || !ctx.message || !('text' in ctx.message)) {
    logger.error('Custom month handler called with invalid context', {
      userId: ctx.from?.id,
      hasMessage: !!ctx.message,
      hasText: ctx.message && 'text' in ctx.message,
    })
    await ctx.reply('Error: Invalid input')
    return
  }

  // Parse MM-YYYY format
  const [month, year] = ctx.message.text.split('-').map(Number)
  logger.info('Custom month received', {
    userId: ctx.from.id,
    monthYear: ctx.message.text,
  })

  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    logger.warn('Invalid month format received', {
      userId: ctx.from.id,
      monthYear: ctx.message.text,
    })
    await ctx.reply('Please enter a valid month and year (MM-YYYY):', Markup.forceReply())
    return
  }

  const date = new Date(year, month - 1)
  await showSummary(ctx, date)
}

async function showSummary(ctx: any, date: Date) {
  if (!ctx.from) {
    logger.error('Show summary called without user context')
    return
  }

  const telegramId = ctx.from.id.toString()

  try {
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    logger.info('Fetching expenses for summary', {
      telegramId,
      year,
      month,
      dateString: date.toISOString(),
    })

    const apiClient = new ApiClient()

    const user = await apiClient.getUserByTelegramId(telegramId)
    if (!user) {
      logger.error('User not found', { telegramId })
      await ctx.reply('Error: User not found')
      return
    }

    await apiClient.syncEmails(user.id)
    const expenses = await apiClient.getExpensesByMonth(user.id, year, month)

    if (!expenses || expenses.length === 0) {
      logger.info('No expenses found for period', {
        telegramId,
        year,
        month,
        dateString: date.toISOString(),
      })
      await ctx.reply(`No expenses found for ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`)
      return
    }

    const total = getTotal(expenses, month, year)

    // Group expenses by merchant
    const byMerchant: { [key: string]: number } = {}
    const merchantDetails: { [key: string]: { [key: string]: number } } = {}

    expenses.forEach((expense: any) => {
      const merchant = expense.merchant
      const amount = getAmount(expense, month, year)

      // Split merchant name by '*' or space
      const parts = merchant.split(/[*\s]/)
      const prefix = parts[0].trim()
      const suffix = parts.slice(1).join(' ').trim()

      // Initialize prefix group if it doesn't exist
      if (!merchantDetails[prefix]) {
        merchantDetails[prefix] = {}
      }

      // Add to total for the prefix
      byMerchant[prefix] = (byMerchant[prefix] || 0) + amount

      // Add to detailed breakdown if there's a suffix
      if (suffix) {
        merchantDetails[prefix][suffix] = (merchantDetails[prefix][suffix] || 0) + amount
      } else {
        // If no suffix, just add to the prefix total
        merchantDetails[prefix][''] = (merchantDetails[prefix][''] || 0) + amount
      }
    })

    // Create summary message
    let message = `*📊 Expenses Summary for ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}*\n\n`
    message += `*Total:* $${total.toFixed(2)}\n\n`
    message += `*Breakdown by merchant:*\n`

    // Sort prefixes by total amount
    Object.entries(byMerchant)
      .sort((a, b) => b[1] - a[1])
      .forEach(([prefix, totalAmount]) => {
        const percentage = ((totalAmount / total) * 100).toFixed(1)
        const subItems = merchantDetails[prefix]
        const subItemKeys = Object.keys(subItems).filter((key) => key !== '')

        // If there's only one sub-item or no sub-items, combine them
        if (subItemKeys.length <= 1) {
          const suffix = subItemKeys[0] || ''
          const fullName = suffix ? `${prefix} ${suffix}` : prefix

          const installmentText = getInstallmentInfo(expenses, fullName, month, year)
          message += `\n*${fullName}:* $${totalAmount.toFixed(2)} (${percentage}%)${installmentText}\n`
        } else {
          // Show hierarchical structure for multiple sub-items
          message += `\n*${prefix}:* $${totalAmount.toFixed(2)} (${percentage}%)\n`
          Object.entries(subItems)
            .sort((a, b) => b[1] - a[1])
            .forEach(([suffix, amount]) => {
              if (suffix) {
                // Only show if there's a suffix
                const subPercentage = ((amount / totalAmount) * 100).toFixed(1)
                const fullMerchant = `${prefix} ${suffix}`

                const installmentText = getInstallmentInfo(expenses, fullMerchant, month, year)
                message += `  └─ ${suffix}: $${amount.toFixed(2)} (${subPercentage}%)${installmentText}\n`
              }
            })
        }
      })

    await ctx.reply(message, { parse_mode: 'Markdown' })
  } catch (error) {
    logger.error('Error fetching expenses for summary', {
      userId: ctx.from.id,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      dateString: date.toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    await ctx.reply('Sorry, there was an error fetching your expenses. Please try again later.')
  } finally {
    // Clear session state
    ctx.session.summaryState = undefined
    logger.info('Summary session cleared', { userId: ctx.from.id })
  }
}

const getTotal = (expenses: any[], month: number, year: number) => {
  return expenses.reduce((sum: number, expense: any) => sum + getAmount(expense, month, year), 0)
}

const getAmount = (expense: any, month: number, year: number) => {
  if (expense.installments) {
    const installment = expense.installments.find((installment: any) =>
      isSameMonthAndYear(installment.dueDate, month, year),
    )
    return installment?.amount || expense.amount
  }
  return expense.amount
}

// Get installment information for a specific merchant
const getInstallmentInfo = (expenses: any[], merchantName: string, month: number, year: number) => {
  const expense = expenses.find((expense: any) => {
    const expMerchant = expense.merchant.trim()
    return expMerchant === merchantName && expense.installments
  })

  if (!expense?.installments) return ''

  const currentInstallment =
    expense.installments.findIndex((installment: any) => isSameMonthAndYear(installment.dueDate, month, year)) + 1

  if (currentInstallment <= 0) return ''

  return ` [${currentInstallment}/${expense.installments.length}]`
}

const isSameMonthAndYear = (dateString: string, month: number, year: number) => {
  const date = new Date(dateString)
  return date.getMonth() + 1 === month && date.getFullYear() === year
}
