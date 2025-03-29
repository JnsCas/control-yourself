import { OnModuleDestroy } from "@nestjs/common";

export abstract class GmailClientAbstract {

  abstract fetchEmails(accessToken: string): Promise<any[]>;
  abstract getMessage(accessToken: string, messageId: string): Promise<any>;
  abstract listMessages(accessToken: string, query: string): Promise<any>;
  
}
