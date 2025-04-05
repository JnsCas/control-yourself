import { Context } from 'telegraf';
import { ApiClient } from '../api/api.client';

export async function authCommand(ctx: Context) {
  if (!ctx.from) {
    await ctx.reply('Error: Could not identify user');
    return;
  }

  const apiClient = new ApiClient();
  
  try {
    const telegramId = ctx.from.id.toString();
    const authUrl = await apiClient.getAuthUrl(telegramId);
    
    await ctx.reply(
      'Please authenticate with Gmail to allow me to read your transaction emails.\n' +
      'Click the link below to start:\n' +
      authUrl
    );
  } catch (error) {
    await ctx.reply(
      'Sorry, I couldn\'t generate the authentication link. Please try again later.'
    );
  }
} 