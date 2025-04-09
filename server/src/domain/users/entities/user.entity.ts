import { MongoIdManager } from '@jnscas/cy/src/domain/mongo/MongoIdManager';
import { UserDocument } from '@jnscas/cy/src/domain/users/schemas/user.schema';

export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly autoExpenseEnabled: boolean,
    public readonly telegramId?: string,
    public readonly lastEmailSync?: Date,
    public readonly googleAccessToken?: string,
    public readonly googleRefreshToken?: string
  ) {}

  static create(data: {
    username: string;
    autoExpenseEnabled: boolean;
    telegramId?: string;
    lastEmailSync?: Date;
    googleAccessToken?: string;
    googleRefreshToken?: string;
  }): User {
    return new User(
      MongoIdManager.randomId(),
      data.username,
      data.autoExpenseEnabled,
      data.telegramId,
      data.lastEmailSync,
      data.googleAccessToken,
      data.googleRefreshToken
    );
  }

  static restore(document: UserDocument): User {
    return new User(
      document._id.toString(),
      document.username,
      document.autoExpenseEnabled,
      document.telegramId,
      document.lastEmailSync,
      document.googleAccessToken,
      document.googleRefreshToken
    );
  }

  static restoreList(documents: UserDocument[]): User[] {
    return documents.map(doc => User.restore(doc));
  }

  toDocument(): Partial<UserDocument> {
    return {
      telegramId: this.telegramId,
      username: this.username,
      autoExpenseEnabled: this.autoExpenseEnabled,
      lastEmailSync: this.lastEmailSync,
      googleAccessToken: this.googleAccessToken,
      googleRefreshToken: this.googleRefreshToken
    };
  }
} 