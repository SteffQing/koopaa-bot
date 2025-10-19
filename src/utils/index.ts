import type { Context, Session } from "../models/telegraf.model";
import dotenv from "dotenv";
dotenv.config();

function getEnv(key: string) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

const asyncPipe =
  <T>(...fns: Array<(arg: T) => Promise<T>>) =>
  async (arg: T) => {
    for (const fn of fns) {
      arg = await fn(arg);
    }
  };

const getDefaultSession = (): Session => ({
  state: "idle",
  token: null,
  toDelete: [],
  msgId: undefined,
});

async function reset(ctx: Context) {
  if (ctx.chat) {
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  }

  const deletions: Promise<unknown>[] = [];

  for (const id of ctx.session.toDelete) {
    deletions.push(ctx.deleteMessage(id).catch(() => {}));
  }

  if (ctx.session.msgId) {
    deletions.push(ctx.deleteMessage(ctx.session.msgId).catch(() => {}));
  }

  // the triggering message -> e.g /start
  // if (ctx.message?.message_id) {
  //   deletions.push(ctx.deleteMessage(ctx.message.message_id).catch(() => {}));
  // }

  await Promise.all(deletions);

  // finally reset session
  ctx.session = { ...getDefaultSession(), token: ctx.session.token };
}

export { asyncPipe, getDefaultSession, getEnv, reset };
