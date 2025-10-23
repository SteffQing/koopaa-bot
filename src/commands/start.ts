import type { Context } from "../models/telegraf.model";
import { reset } from "../utils";
import { errorWrapper } from "../utils/helpers";
import botCommands from "./commands";

async function _startCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") return await ctx.reply("Hello 🫡, and welcome 😌");

  const { from, session } = ctx;
  if (!from) throw new Error("No user found");
  if (session.token === null) throw new Error("You are not signed in, call /sign_in to authenticate!");

  await reset(ctx);
  await ctx.reply("Hello 🫡, and welcome 😌");
}

async function helpCmd(ctx: Context) {
  const helpText = botCommands.map((c) => `/${c.command} - ${c.description}`).join("\n");
  await ctx.reply(`Here are the available commands:\n\n${helpText}`);
}

const startCmd = errorWrapper(_startCmd);

export { startCmd, helpCmd };
