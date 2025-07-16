import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { GmailAuthException } from '@jnscas/cy/src/domain/gmail/gmail-auth.exception'

@Catch(GmailAuthException)
export class AuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuthExceptionFilter.name)

  catch(exception: GmailAuthException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()
    const request = ctx.getRequest()

    this.logger.warn('Gmail authentication error detected', {
      error: exception.message,
      userId: exception.userId,
      path: request.url,
    })

    return response.status(HttpStatus.UNAUTHORIZED).send({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Authentication required',
      error: 'Gmail authentication failed',
      code: 'GMAIL_AUTH_REQUIRED',
      userId: exception.userId,
    })
  }
}
