import { Module } from "@nestjs/common";
import { EmailParser } from "./email.parser";

@Module({
  providers: [EmailParser],
  exports: [EmailParser],
})
export class EmailModule {}