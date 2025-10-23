import type { Context } from "../models/telegraf.model";
import { getDefaultSession, reset } from "../utils";
import { query } from "../utils/fetch";
import { errorWrapper, getApiData } from "../utils/helpers";

async function _signInCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") throw new Error("This command can only be used in private chat");

  const { from, session } = ctx;
  if (!from) throw new Error("No user found");

  await ctx.sendChatAction("typing");
  const { data, error, message } = await query.post<{ token: string }>("/auth/external", {
    body: { id: from.id.toString() },
    headers: { Authorization: `Bearer ${ctx.telegram.token}` },
  });

  const { token } = getApiData(error, data);
  ctx.session = { ...session, token };

  const { message_id } = await ctx.reply(message ?? "Welcome back!");
  ctx.session.toDelete.push(message_id);
}

async function _signUpCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") throw new Error("This command can only be used in private chat");

  const { from, session } = ctx;
  if (!from) throw new Error("No user found");
  if (session.token) throw new Error("You are already signed in! Please call /sign_out to sign out.");

  ctx.session.state = "auth:email";
  const { message_id } = await ctx.reply("Please provide an email address (An OTP will be sent to verify)", {
    reply_markup: {
      force_reply: true,
    },
  });
  ctx.session.toDelete.push(message_id);
}

async function _signOutCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") throw new Error("This command can only be used in private chat");
  if (!ctx.session.token) throw new Error("You are not signed in! Please call /sign_in to sign in.");

  await reset(ctx);
  ctx.session = getDefaultSession();
  await ctx.reply("You have been signed out! Please call /sign_in to sign in.");
}

async function _revalidateCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") throw new Error("This command can only be used in private chat");

  const { from, session } = ctx;
  if (!from || !ctx.message) throw new Error("No user found");
  if (!session.token) throw new Error("You are not signed in! Please call /sign_in to sign in.");

  await ctx.sendChatAction("typing");
  const { error, message } = await query.put<{ token: string }>("/auth/revalidate", {
    body: { id: from.id.toString() },
    headers: { Authorization: `Bearer ${ctx.telegram.token}` },
  });

  await reset(ctx, true);
  if (error || !message) throw error;

  const { message_id } = await ctx.reply(message);
  ctx.session.toDelete.push(message_id);
  ctx.session.state = "auth:revalidate";
}

const signInCmd = errorWrapper(_signInCmd);
const signUpCmd = errorWrapper(_signUpCmd);
const signOutCmd = errorWrapper(_signOutCmd);
const revalidateCmd = errorWrapper(_revalidateCmd);

export { signInCmd, signOutCmd, signUpCmd, revalidateCmd };
