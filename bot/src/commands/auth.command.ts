import { Context } from 'telegraf';
import { GmailAuth } from '../auth/gmail.auth';

export async function authCommand(ctx: Context) {
  const gmailAuth = new GmailAuth();
  const authUrl = gmailAuth.generateAuthUrl();
  
  await ctx.reply(
    'Please authenticate with Gmail to allow me to read your transaction emails.\n' +
    'Click the link below to start:\n' +
    authUrl
  );
} 