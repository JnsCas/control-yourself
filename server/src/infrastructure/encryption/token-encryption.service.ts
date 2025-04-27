import { Injectable } from '@nestjs/common'
import * as crypto from 'crypto'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class TokenEncryptionService {
  private readonly algorithm = 'aes-256-gcm'
  private readonly encryptionKey: Buffer

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('ENCRYPTION_KEY')
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is not set')
    }

    this.encryptionKey = Buffer.from(key, 'hex')
  }

  encrypt(text: string): string {
    if (!text) return null
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText) return null

    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format')
    }

    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encryptedData = parts[2]

    const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }
}
