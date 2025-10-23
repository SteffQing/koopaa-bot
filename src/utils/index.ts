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

async function reset(ctx: Context, full_reset = false) {
  if (ctx.chat) {
    await ctx.telegram.sendChatAction(ctx.chat.id, "typing");
  }

  const deletions: Promise<unknown>[] = [];

  for (const id of ctx.session.toDelete) {
    deletions.push(ctx.deleteMessage(id).catch(() => {}));
  }

  await Promise.all(deletions);

  if (full_reset) {
    ctx.session = getDefaultSession();
  } else ctx.session = { ...getDefaultSession(), token: ctx.session.token };
}

function truncate(address: string, start = 5, end = 3) {
  if (address.length < start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export { asyncPipe, getDefaultSession, getEnv, reset, truncate };
