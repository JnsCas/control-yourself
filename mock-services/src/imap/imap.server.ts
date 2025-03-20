import { ImapFlow } from 'imapflow';

export class ImapServer {
  private server: ImapFlow;

  constructor() {
    this.server = new ImapFlow({
      host: 'localhost',
      port: 1143,
      auth: {
        user: 'test@example.com',
        pass: 'test123'
      },
      secure: false,
      logger: true
    });
  }

  async start() {
    try {
      await this.server.connect();
      console.log('Mock IMAP server running on port 1143');
    } catch (error) {
      console.error('Failed to start IMAP server:', error);
      throw error;
    }
  }

  async disconnect() {
    await this.server.close();
    console.log('Mock IMAP server stopped');
  }

  async openMailbox(name: string) {
    return this.server.mailboxOpen(name);
  }

  async appendEmail(mailbox: string, email: any) {
    return this.server.append(mailbox, email);
  }
} 