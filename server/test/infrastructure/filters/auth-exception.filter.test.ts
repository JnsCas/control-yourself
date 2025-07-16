import { AuthExceptionFilter } from '@jnscas/cy/src/infrastructure/filters/auth-exception.filter'
import { GmailAuthException } from '@jnscas/cy/src/domain/gmail/gmail-auth.exception'
import { ArgumentsHost } from '@nestjs/common'

describe('AuthExceptionFilter', () => {
  let filter: AuthExceptionFilter
  let mockResponse: any
  let mockRequest: any
  let mockHost: ArgumentsHost

  beforeEach(() => {
    filter = new AuthExceptionFilter()

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    }

    mockRequest = {
      url: '/test-endpoint',
    }

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any
  })

  it('should handle GmailAuthException correctly', () => {
    const exception = new GmailAuthException('Test auth error', 'user123', new Error('Original error'))

    filter.catch(exception, mockHost)

    expect(mockResponse.status).toHaveBeenCalledWith(401)
    expect(mockResponse.send).toHaveBeenCalledWith({
      statusCode: 401,
      message: 'Authentication required',
      error: 'Gmail authentication failed',
      code: 'GMAIL_AUTH_REQUIRED',
      userId: 'user123',
    })
  })
})
