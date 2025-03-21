import { Logger } from "@nestjs/common";
import { ImapClientAbstract } from "./imap.client.abstract";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";

export class ImapClientDev extends ImapClientAbstract {

  private readonly client: AxiosInstance;

  constructor(private configService: ConfigService) {
    super();
    this.client = axios.create({
      baseURL: this.configService.get("IMAP_HOST"),
      auth: {
        username: this.configService.get("IMAP_USER"),
        password: this.configService.get("IMAP_PASSWORD"),
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    Logger.log("IMAP Client Dev destroyed");
  }

  async connect(): Promise<void> {
    Logger.log("IMAP Client Dev connected");
  }

  async disconnect(): Promise<void> {
    Logger.log("IMAP Client Dev disconnected");
  }

  async fetchUnreadEmails(): Promise<any[]> {
    Logger.log("IMAP Client Dev fetching unread emails");
    const { status, data } = await this.client.get("/unread-emails");
    if (status !== 200) {
      throw new Error("Failed to fetch unread emails from IMAP Client Dev");
    }
    return data;
  }
}