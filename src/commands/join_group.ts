import { Telegraf, Context } from "telegraf";
import { joinGroupMessages } from "../handlers/join_group";

interface ExtendedContext extends Context {
  // Add any additional properties specific to your bot
}

export const joinGroupCommand = (bot: Telegraf<ExtendedContext>) => {
  bot.command("join_group", async (ctx: ExtendedContext) => {
    try {
      // Extract user information from context
      const user = ctx.from;
      if (!user) {
        await ctx.reply("Sorry, I could not identify your user information.");
        return;
      }

      // Format the join group message
      const joinGroupMessage = joinGroupMessages.getJoinGroupMessage(user.first_name || user.username || "User");

      // Send the join group message
      await ctx.reply(joinGroupMessage, { parse_mode: "Markdown" });

      // Provide instructions for joining a group
      await ctx.reply(joinGroupMessages.getJoinInstructions());
    } catch (error) {
      console.error("Error in join_group command:", error);
      await ctx.reply("An error occurred while processing your request.");
    }
  });
};
