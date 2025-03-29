import { Injectable, Logger } from "@nestjs/common";
import { GmailClientAbstract } from "./gmail.client.abstract";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosInstance } from "axios";

const logger = new Logger('GmailClientDev');

@Injectable()
export class GmailClientDev extends GmailClientAbstract {

  private readonly client: AxiosInstance;
  
  constructor(private readonly configService: ConfigService) {
    super();
    const host = this.configService.get("IMAP_HOST");
    const port = this.configService.get("MOCKSERVER_PORT");
    this.client = axios.create({ baseURL: `${host}:${port}/imap` });
  }

  getMessage(accessToken: string, messageId: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  
  listMessages(accessToken: string, query: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  
  async fetchEmails(accessToken: string): Promise<any[]> {
    logger.log("IMAP Client Dev fetching unread emails");
    const { status, data } = await this.client.get("/emails/unread");
    if (status !== 200) {
      throw new Error("Failed to fetch unread emails from IMAP Client Dev");
    }
    return data;
  }
}