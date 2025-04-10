import { Module } from "@nestjs/common";
import { EmailParser } from "../../domain/email/email.parser";

@Module({
  providers: [EmailParser],
  exports: [EmailParser],
})
export class EmailModule {}