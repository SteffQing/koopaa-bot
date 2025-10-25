import type { Context } from "../models/telegraf.model";
import { reset } from "../utils";
import { errorWrapper } from "../utils/helpers";
import botCommands from "./commands";
import { addParticipantCmd_ } from "./group";

async function _startCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") return await ctx.reply("Hello 🫡, and welcome 😌");

  const { from, session, message } = ctx;
  if (!from) throw new Error("No user found");
  if (session.token === null) throw new Error("You are not signed in, call /sign_in to authenticate!");
  if (!message || !("text" in message)) throw new Error("No message found 🫣");

  if (message.text.split(" ")[1]?.startsWith("add_")) return addParticipantCmd_(ctx);

  await reset(ctx);
  await ctx.reply("Hello 🫡, and welcome 😌");
}

async function helpCmd(ctx: Context) {
  const helpText = botCommands.map((c) => `/${c.command} - ${c.description}`).join("\n");
  await ctx.reply(`Here are the available commands:\n\n${helpText}`);
}

const startCmd = errorWrapper(_startCmd);

export { startCmd, helpCmd };
