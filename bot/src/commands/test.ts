import { Context } from 'telegraf';
import { ApiClient } from '../api/api.client';

export const testCommand = async (ctx: Context) => {
  const apiClient = new ApiClient();
  const emails = await apiClient.processNewEmails();
  await ctx.reply(JSON.stringify(emails));
}; 