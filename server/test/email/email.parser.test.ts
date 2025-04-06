import { Test, TestingModule } from '@nestjs/testing';
import { EmailParser } from '@jnscas/cy/src/email/email.parser';
import { ExpenseCurrency } from '@jnscas/cy/src/expenses/types/expense.types';

describe('EmailParser', () => {
  let parser: EmailParser;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailParser],
    }).compile();

    parser = module.get<EmailParser>(EmailParser);
  });

  describe('parseEmailData', () => {
    it('should parse a valid accepted transaction email', () => {
      const emailData = {
        id: '1944a80e0052f729',
        internalDate: '1736416747000',
        payload: {
          body: {
            data: Buffer.from(`
              Su tarjeta Visa con terminación 5244 se acaba de usar en línea o por teléfono para la siguiente transacción:
              Comercio: Starlink
              País: ARG
              Ciudad: CABA
              Tarjeta: 5244
              Autorización: 003816
              Referencia: True
              Tipo de transacción: Compra
              Moneda: ARS
              Monto: 38000.00
            `).toString('base64')
          }
        }
      };

      const result = parser.parseEmailData(emailData);
      
      expect(result).toEqual({
        id: '1944a80e0052f729',
        date: new Date(1736416747000),
        amount: 38000,
        merchant: 'Starlink',
        cardNumber: '5244',
        currency: ExpenseCurrency.ARS
      });
    });

    it('should return null for a rejected transaction', () => {
      const emailData = {
        id: '1944a80d62ca9a17',
        internalDate: '1736416745000',
        payload: {
          body: {
            data: Buffer.from(`
              Su tarjeta Visa con terminación 5244 acaba de ser RECHAZADA para la siguiente transacción:
              Comercio: DLO*Starlink
              País: ARG
              Ciudad: CAPITAL FEDER
              Tarjeta: 5244
              Autorización: NA
              Referencia: False
              Tipo de transacción: Compra
              Moneda: ARS
              Monto: 38000.00
            `).toString('base64')
          }
        }
      };

      const result = parser.parseEmailData(emailData);
      expect(result).toBeNull();
    });

    it('should handle USD currency correctly', () => {
      const emailData = {
        id: 'test-id',
        internalDate: '1736416747000',
        payload: {
          body: {
            data: Buffer.from(`
              Su tarjeta Visa con terminación 1234 se acaba de usar para la siguiente transacción:
              Comercio: Test Merchant
              País: USA
              Ciudad: New York
              Tarjeta: 1234
              Autorización: 123456
              Referencia: True
              Tipo de transacción: Compra
              Moneda: USD
              Monto: 100.00
            `).toString('base64')
          }
        }
      };

      const result = parser.parseEmailData(emailData);
      expect(result?.currency).toBe(ExpenseCurrency.USD);
    });

    it('should handle amounts with thousand separators', () => {
      const emailData = {
        id: 'test-id',
        internalDate: '1736416747000',
        payload: {
          body: {
            data: Buffer.from(`
              Su tarjeta Visa con terminación 1234 se acaba de usar para la siguiente transacción:
              Comercio: Test Merchant
              País: ARG
              Ciudad: Buenos Aires
              Tarjeta: 1234
              Autorización: 123456
              Referencia: True
              Tipo de transacción: Compra
              Moneda: ARS
              Monto: 1234,56
            `).toString('base64')
          }
        }
      };

      const result = parser.parseEmailData(emailData);
      expect(result?.amount).toBe(1234);
    });

    it('should throw error for invalid email data', () => {
      const emailData = null;
      expect(() => parser.parseEmailData(emailData)).toThrow('Email data is null or undefined');
    });

    it('should throw error for email without payload', () => {
      const emailData = {
        id: 'test-id',
        internalDate: '1736416747000'
      };
      expect(() => parser.parseEmailData(emailData)).toThrow('Invalid email data structure: missing payload');
    });

    it('should throw error for email without body data', () => {
      const emailData = {
        id: 'test-id',
        internalDate: '1736416747000',
        payload: {}
      };
      expect(() => parser.parseEmailData(emailData)).toThrow('nvalid email data structure: missing payload.');
    });

    it('should parse amounts correctly by taking only integer part', () => {
      const testCases = [
        {
          input: '38000.00(puede haber una diferencia en el monto real)',
          expected: 38000
        },
        {
          input: '1234,56(puede haber una diferencia en el monto real)',
          expected: 1234
        },
        {
          input: '100.00(puede haber una diferencia en el monto real)',
          expected: 100
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const emailData = {
          id: 'test-id',
          internalDate: '1736416747000',
          payload: {
            body: {
              data: Buffer.from(`
                Su tarjeta Visa con terminación 1234 se acaba de usar para la siguiente transacción:
                Comercio: Test Merchant
                País: ARG
                Ciudad: Buenos Aires
                Tarjeta: 1234
                Autorización: 123456
                Referencia: True
                Tipo de transacción: Compra
                Moneda: ARS
                Monto: ${input}
              `).toString('base64')
            }
          }
        };

        const result = parser.parseEmailData(emailData);
        expect(result?.amount).toBe(expected);
      });
    });
  });
}); 