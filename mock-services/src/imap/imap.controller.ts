import { Controller, Post, Get } from "@nestjs/common";
import { Logger } from "@nestjs/common";

const logger = new Logger("ImapController");

@Controller("imap")
export class ImapController {
  @Get("emails/unread")
  async getUnreadEmails() {
    logger.log("Retrieving unread emails...");
    return [
      {
        from: "visa@notifications.visa.com",
        to: "test@example.com",
        subject: "Transaction Alert",
        text: "Amount: 50.00\nMerchant: Test Store\nDate: 2024-03-20",
        flags: ["\\Seen"],
      },
    ];
  }

  @Post("connect")
  async connect() {
    logger.log("Connecting to IMAP server...");
    return { status: "connected" };
  }

  @Post("disconnect")
  async disconnect() {
    logger.log("Disconnecting from IMAP server...");
    return { status: "disconnected" };
  }
}
