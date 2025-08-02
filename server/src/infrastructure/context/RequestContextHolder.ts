import { requestContext } from '@fastify/request-context'
import { CYRequestContext } from './CYRequestContext'

const REQUEST_CONTEXT_KEY = 'cyRequestContext'

declare module '@fastify/request-context' {
  interface RequestContextData {
    [REQUEST_CONTEXT_KEY]: CYRequestContext
  }
}

export class RequestContextHolder {
  static init(cyRequestContext: CYRequestContext) {
    requestContext.set(REQUEST_CONTEXT_KEY, cyRequestContext)
  }

  static getContext(): CYRequestContext {
    return requestContext.get(REQUEST_CONTEXT_KEY)
  }
}
