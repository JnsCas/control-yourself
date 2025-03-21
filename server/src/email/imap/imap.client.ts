import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Imap from 'imap';
import { ImapClientAbstract } from './imap.client.abstract';

@Injectable()
export class ImapClient extends ImapClientAbstract {
  private imap: Imap;

  constructor(private configService: ConfigService) {
    super();
    this.imap = new Imap({
      user: this.configService.get<string>('IMAP_USER'),
      password: this.configService.get<string>('IMAP_PASSWORD'),
      host: this.configService.get<string>('IMAP_HOST'),
      port: this.configService.get<number>('IMAP_PORT'),
      tls: this.configService.get<boolean>('IMAP_TLS'),
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => resolve());
      this.imap.once('error', (err) => reject(err));
      this.imap.connect();
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.imap.end();
      resolve();
    });
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async fetchUnreadEmails(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) reject(err);

        const searchCriteria = [
          'UNSEEN',
          ['FROM', this.configService.get<string>('EMAIL_FROM')],
          ['SUBJECT', this.configService.get<string>('EMAIL_SUBJECT')],
        ];

        this.imap.search(searchCriteria, (err, results) => {
          if (err) reject(err);
          if (!results.length) resolve([]);

          const fetch = this.imap.fetch(results, {
            bodies: '',
            markSeen: true,
          });

          const emails = [];

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              let buffer = '';
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
              stream.once('end', () => {
                emails.push(buffer);
              });
            });
          });

          fetch.once('error', (err) => reject(err));
          fetch.once('end', () => resolve(emails));
        });
      });
    });
  }
} 