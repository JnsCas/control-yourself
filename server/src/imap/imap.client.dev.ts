import { Injectable, Logger } from "@nestjs/common";
import { ImapClientAbstract } from "./imap.client.abstract";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";

const logger = new Logger('ImapClientDev');

@Injectable()
export class ImapClientDev extends ImapClientAbstract {

  private readonly client: AxiosInstance;

  constructor(private readonly configService: ConfigService) {
    super();
    this.client = axios.create({
      baseURL: `${this.configService.get("IMAP_HOST")}:${this.configService.get("MOCKSERVER_PORT")}/imap`,
    });
  }

  async onModuleDestroy(): Promise<void> {
    logger.log("IMAP Client Dev destroyed");
  }

  async connect(): Promise<void> {
    logger.log("IMAP Client Dev connected");
  }

  async disconnect(): Promise<void> {
    logger.log("IMAP Client Dev disconnected");
  }

  async fetchUnreadEmails(): Promise<any[]> {
    logger.log("IMAP Client Dev fetching unread emails");
    const { status, data } = await this.client.get("/emails/unread");
    if (status !== 200) {
      throw new Error("Failed to fetch unread emails from IMAP Client Dev");
    }
    return data;
  }
}