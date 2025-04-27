import { MongoIdManager } from '@jnscas/cy/src/domain/mongo/MongoIdManager'
import { UserDocument } from '@jnscas/cy/src/domain/users/user.schema'

export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly autoExpenseEnabled: boolean,
    public readonly telegramId?: string,
    public readonly lastEmailSync?: Date,
    public readonly encryptedGoogleAccessToken?: string,
    public readonly encryptedGoogleRefreshToken?: string,
  ) {}

  static create(
    username: string,
    autoExpenseEnabled: boolean,
    telegramId?: string,
    lastEmailSync?: Date,
    encryptedGoogleAccessToken?: string,
    encryptedGoogleRefreshToken?: string,
  ): User {
    return new User(
      MongoIdManager.randomId(),
      username,
      autoExpenseEnabled,
      telegramId,
      lastEmailSync,
      encryptedGoogleAccessToken,
      encryptedGoogleRefreshToken,
    )
  }

  static restore(document: UserDocument): User {
    return new User(
      document._id.toString(),
      document.username,
      document.autoExpenseEnabled,
      document.telegramId,
      document.lastEmailSync,
      document.encryptedGoogleAccessToken,
      document.encryptedGoogleRefreshToken,
    )
  }

  static restoreList(documents: UserDocument[]): User[] {
    return documents.map((doc) => User.restore(doc))
  }

  toDocument(): Partial<UserDocument> {
    return {
      telegramId: this.telegramId,
      username: this.username,
      autoExpenseEnabled: this.autoExpenseEnabled,
      lastEmailSync: this.lastEmailSync,
      encryptedGoogleAccessToken: this.encryptedGoogleAccessToken,
      encryptedGoogleRefreshToken: this.encryptedGoogleRefreshToken,
    }
  }
}
