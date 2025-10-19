import { Telegraf, Context } from 'telegraf';
import { createGroupMessages } from '../messages/create_group';

interface ExtendedContext extends Context {
  // Add any additional properties specific to your bot
}

export const createGroupCommand = (bot: Telegraf<ExtendedContext>) => {
  bot.command('create_group', async (ctx: ExtendedContext) => {
    try {
      // Extract user information from context
      const user = ctx.from;
      if (!user) {
        await ctx.reply('Sorry, I could not identify your user information.');
        return;
      }

      // Format the create group message
      const createGroupMessage = createGroupMessages.getCreateGroupMessage(user.first_name || user.username || 'User');
      
      // Send the create group message
      await ctx.reply(createGroupMessage, { parse_mode: 'Markdown' });
      
      // In a real implementation, you would start a conversation flow to collect group details
      // For now, we'll just provide instructions
      await ctx.reply(createGroupMessages.getGroupCreationInstructions());
    } catch (error) {
      console.error('Error in create_group command:', error);
      await ctx.reply('An error occurred while processing your request.');
    }
  });
};