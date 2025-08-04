import { ConfigService } from '@nestjs/config'

export const validateConfig = (configService: ConfigService) => {
  const requiredVars = [
    'SERVER_PORT',
    'SERVER_HOST',
    'NODE_ENV',
    'EMAIL_FROM',
    'EMAIL_SUBJECT',
    'MONGODB_URI',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'ENCRYPTION_KEY',
    'CLIENT_URL',
  ]
  const missingVars = requiredVars.filter((varName) => !configService.get(varName))
  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
  }
}
