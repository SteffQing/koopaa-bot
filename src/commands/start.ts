import type { Context } from "../models/telegraf.model";
import { reset } from "../utils";
import botCommands from "./commands";

async function startCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") return;

  try {
    const { from, session } = ctx;
    if (!from) return;

    if (session.token === null) {
      const { message_id } = await ctx.reply(
        "You are currently not signed in, please call the /sign_in command to authenticate yourself in!"
      );
      ctx.session.toDelete.push(message_id);
      return;
    }

    await reset(ctx);
    const { message_id } = await ctx.reply("Hello 🫡");
    ctx.session.toDelete.push(message_id);
  } catch (error) {
    const { message_id } = await ctx.reply("An error occurred. Please try again later.");
    ctx.session.toDelete.push(message_id);
  }
}

async function helpCmd(ctx: Context) {
  const helpText = botCommands.map((c) => `/${c.command} - ${c.description}`).join("\n");

  const { message_id } = await ctx.reply(`Here are the available commands:\n\n${helpText}`);

  await ctx.deleteMessage(ctx.message?.message_id).catch(() => {});
  ctx.session.toDelete.push(message_id);
}

export { startCmd, helpCmd };
