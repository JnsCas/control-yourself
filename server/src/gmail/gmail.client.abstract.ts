import { User } from "src/users/schemas/user.schema";

export abstract class GmailClientAbstract {

  abstract fetchEmailsIds(user: User, sinceDate?: Date): Promise<any[]>;
  abstract fetchMessage(user: User, messageId: string): Promise<any>;
  
}
