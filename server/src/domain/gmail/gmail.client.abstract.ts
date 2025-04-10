import { User } from "src/domain/users/entities/user.entity";

export abstract class GmailClientAbstract {

  abstract fetchEmailsIds(user: User, sinceDate?: Date): Promise<any[]>;
  abstract fetchMessage(user: User, messageId: string): Promise<any>;
  
}
