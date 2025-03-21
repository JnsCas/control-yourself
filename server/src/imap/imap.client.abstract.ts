import { OnModuleDestroy } from "@nestjs/common";

export abstract class ImapClientAbstract implements OnModuleDestroy {

  abstract onModuleDestroy(): Promise<void>;

  abstract connect(): Promise<void>;

  abstract disconnect(): Promise<void>;

  abstract fetchUnreadEmails(): Promise<any[]>;
}
