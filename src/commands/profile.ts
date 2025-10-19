import { Telegraf, Context } from 'telegraf';
import { profileMessages } from '../messages/profile';

interface ExtendedContext extends Context {
  // Add any additional properties specific to your bot
}

export const profileCommand = (bot: Telegraf<ExtendedContext>) => {
  bot.command('profile', async (ctx: ExtendedContext) => {
    try {
      // Extract user information from context
      const user = ctx.from;
      if (!user) {
        await ctx.reply('Sorry, I could not identify your user information.');
        return;
      }

      // In a real implementation, you would fetch user's wallet info from a database
      // For now, we'll simulate with placeholder data
      const userProfile = {
        userId: user.id,
        username: user.username || 'N/A',
        firstName: user.first_name || 'Unknown',
        lastName: user.last_name || '',
        walletAddress: '0x...' // Placeholder - in reality, this would come from your database
      };

      // Format the profile message
      const profileMessage = profileMessages.getProfileMessage(userProfile);
      
      // Send the profile message
      await ctx.reply(profileMessage);
    } catch (error) {
      console.error('Error in profile command:', error);
      await ctx.reply('An error occurred while retrieving your profile.');
    }
  });
};