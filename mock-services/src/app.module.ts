import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ImapModule } from "./imap/imap.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ImapModule,
  ],
})
export class AppModule {}
