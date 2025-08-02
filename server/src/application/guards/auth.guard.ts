import { CYRequestContext } from '@jnscas/cy/src/infrastructure/context/CYRequestContext'
import { RequestContextHolder } from '@jnscas/cy/src/infrastructure/context/RequestContextHolder'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { OAuth2Client } from 'google-auth-library'
import { CanActivate, ExecutionContext } from '@nestjs/common'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly oAuth2Client: OAuth2Client) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>()
    const token = request.headers['authorization'] as string
    if (!token) {
      throw new UnauthorizedException()
    }

    const decoded = await this.oAuth2Client.getTokenInfo(token)
    if (!decoded) {
      throw new UnauthorizedException()
    }

    RequestContextHolder.init(new CYRequestContext(decoded.email as string))
    return true
  }
}
