import { Injectable, Logger } from '@nestjs/common'
import { ExpenseCurrency } from '@jnscas/cy/src/domain/expenses/expense.types'

export interface ParsedEmailTransaction {
  id: string
  date: Date
  amount: number
  merchant: string
  cardNumber: string
  currency: ExpenseCurrency
}

@Injectable()
export class EmailParser {
  private readonly logger = new Logger(EmailParser.name)

  parseEmailData(emailData: any): ParsedEmailTransaction | null {
    if (!emailData) {
      throw new Error('Email data is null or undefined')
    }

    if (!emailData.payload || Object.keys(emailData.payload).length === 0) {
      throw new Error(`Invalid email data structure: missing payload. Email ID: ${emailData.id}`)
    }

    const body = this.parseEmailBody(emailData.payload)

    const isAccepted = this.isAcceptedTransaction(body)
    if (!isAccepted) {
      this.logger.log(`Skipping non-accepted transaction for email ID: ${emailData.id}`)
      return null
    }

    return {
      id: emailData.id,
      date: new Date(parseInt(emailData.internalDate)),
      amount: this.parseEmailAmount(body),
      merchant: this.parseEmailMerchant(body),
      cardNumber: this.parseEmailCardNumber(body),
      currency: this.parseEmailCurrency(body),
    }
  }

  private isAcceptedTransaction(body: string): boolean {
    const referenciaMatch = body.match(/Referencia:\s*(True|False)/i)
    return referenciaMatch ? referenciaMatch[1].toLowerCase() === 'true' : false
  }

  private parseEmailAmount(body: string): number {
    const amountMatch = body.match(/Monto:\s*([\d,.]+)/i)
    if (!amountMatch) {
      throw new Error('Could not find amount in email body')
    }

    // Remove any HTML tags and take only the integer part of the number
    const cleanAmount = amountMatch[1].replace(/<[^>]*>/g, '').replace(/[.,].*$/, '')
    return parseInt(cleanAmount, 10)
  }

  private parseEmailMerchant(body: string): string {
    const merchantMatch = body.match(/Comercio:\s*(.+)/i)
    if (!merchantMatch) {
      throw new Error('Could not find merchant in email body')
    }
    // Remove any HTML tags and trim whitespace
    return merchantMatch[1].replace(/<[^>]*>/g, '').trim()
  }

  private parseEmailCardNumber(body: string): string {
    const cardMatch = body.match(/Tarjeta:\s*(\d+)/i)
    if (!cardMatch) {
      throw new Error('Could not find card number in email body')
    }
    // Remove any HTML tags and get only digits
    return cardMatch[1].replace(/<[^>]*>/g, '').replace(/\D/g, '')
  }

  private parseEmailCurrency(body: string): ExpenseCurrency {
    const currencyMatch = body.match(/Moneda:\s*(.+)/i)
    if (!currencyMatch) {
      return ExpenseCurrency.ARS
    }
    // Remove any HTML tags and trim whitespace
    const cleanCurrency = currencyMatch[1].replace(/<[^>]*>/g, '').trim()
    return cleanCurrency as ExpenseCurrency
  }

  private parseEmailBody(payload: any): string {
    if (!payload) {
      throw new Error('Invalid payload: payload is null or undefined')
    }

    this.logger.debug(`Parsing email body from payload: ${JSON.stringify(payload, null, 2)}`)

    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString()
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString()
        }
      }

      this.logger.debug(
        `No text/plain part found. Available parts: ${payload.parts.map((p: any) => p.mimeType).join(', ')}`,
      )
    }

    throw new Error(
      `Could not find email body in plain text format. ` +
        `Payload structure: hasBody=${!!payload.body}, hasParts=${!!payload.parts}`,
    )
  }
}
