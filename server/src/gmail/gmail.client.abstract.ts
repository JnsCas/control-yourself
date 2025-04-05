import { User } from "src/users/schemas/user.schema";

export abstract class GmailClientAbstract {

  abstract fetchEmails(user: User): Promise<any[]>;
  abstract fetchMessage(user: User, messageId: string): Promise<any>;
  
}
