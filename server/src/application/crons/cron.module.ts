import { Module } from "@nestjs/common";
import { SyncEmailsCron } from "@jnscas/cy/src/application/crons/sync-emails.cron";

@Module({
  providers: [SyncEmailsCron],
})
export class CronModule {}