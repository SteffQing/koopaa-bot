import { Telegraf, Context } from "telegraf";
import { myGroupsMessages } from "../handlers/my_groups";

interface ExtendedContext extends Context {
  // Add any additional properties specific to your bot
}

export const myGroupsCommand = (bot: Telegraf<ExtendedContext>) => {
  bot.command("my_groups", async (ctx: ExtendedContext) => {
    try {
      // Extract user information from context
      const user = ctx.from;
      if (!user) {
        await ctx.reply("Sorry, I could not identify your user information.");
        return;
      }

      // In a real implementation, you would fetch the user's groups from a database
      // For now, we'll simulate with placeholder data
      const userGroups = [
        { id: "grp_001", name: "Family Savings", members: 4, totalAmount: 400 },
        { id: "grp_002", name: "Friends Trip Fund", members: 6, totalAmount: 900 },
      ];

      // Format the my groups message
      const myGroupsMessage = myGroupsMessages.getMyGroupsMessage(userGroups);

      // Send the my groups message
      await ctx.reply(myGroupsMessage, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("Error in my_groups command:", error);
      await ctx.reply("An error occurred while retrieving your groups.");
    }
  });
};
