import { Module } from "@nestjs/common";
import { SyncEmailsCron } from "./sync-emails.cron";

@Module({
  providers: [SyncEmailsCron],
})
export class CronModule {}