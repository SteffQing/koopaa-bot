import cache from "../db/cache";
import type { Context } from "../models/telegraf.model";
import { getDefaultSession, reset } from "../utils";
import { query } from "../utils/fetch";

async function signInCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") return;

  try {
    const { from, session } = ctx;
    if (!from) return;

    await ctx.sendChatAction("typing");

    const { data, error, message } = await query.post<{ token: string }>("/auth/external", {
      body: { id: from.id.toString() },
      headers: { Authorization: `Basic ${ctx.telegram.token}` },
    });

    if (error) {
      const { message_id } = await ctx.reply(error);
      ctx.session.toDelete.push(message_id);
      return;
    }

    if (!data) throw new Error("Empty data");

    ctx.session = { ...session, token: data.token };

    const { message_id } = await ctx.reply(message ?? "Welcome back!");
    ctx.session.toDelete.push(message_id);
  } catch (error) {
    console.error("An error occured in signInCmd", error);
    const { message_id } = await ctx.reply("An error occurred. Please try again later.");
    ctx.session.toDelete.push(message_id);
  }
}

async function signUpCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") return;

  try {
    const { from, session } = ctx;
    if (!from) return;

    if (session.token) {
      const { message_id } = await ctx.reply("You are already signed in! Please call /sign_out to sign out.");
      ctx.session.toDelete.push(message_id);
      return;
    }

    ctx.session.state = "auth:email";
    const { message_id } = await ctx.reply("Please provide an email address (An OTP will be sent to verify)", {
      reply_markup: {
        force_reply: true,
      },
    });
    ctx.session.toDelete.push(message_id);
  } catch (error) {
    console.error("An error occured in signUpCmd", error);
    const { message_id } = await ctx.reply("An error occurred. Please try again later.");
    ctx.session.toDelete.push(message_id);
  }
}

async function signOutCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") return;

  try {
    if (!ctx.session.token) {
      const { message_id } = await ctx.reply("You are not signed in! Please call /sign_in to sign in.");
      ctx.session.toDelete.push(message_id);
      return;
    }

    await reset(ctx);
    ctx.session = getDefaultSession();
    ctx.deleteMessage(ctx.message?.message_id).catch(() => {});

    const { message_id } = await ctx.reply("You have been signed out! Please call /sign_in to sign in.");
    ctx.session.toDelete.push(message_id);
  } catch (error) {
    console.error("An error occured in signOutCmd", error);
    const { message_id } = await ctx.reply("An error occurred. Please try again later.");
    ctx.session.toDelete.push(message_id);
  }
}

async function revalidateCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") return;

  const { from, session } = ctx;
  if (!from) return;

  if (!session.token) {
    const { message_id } = await ctx.reply("You are not signed in! Please call /sign_in to sign in.");
    ctx.session.toDelete.push(message_id);
    return;
  }
  try {
    await ctx.sendChatAction("typing");
    const { error, message } = await query.put<{ token: string }>("/auth/revalidate", {
      body: { id: from.id.toString() },
      headers: { Authorization: `Basic ${ctx.telegram.token}` },
    });

    if (error || !message) throw error;

    const { message_id } = await ctx.reply(message);
    ctx.session.toDelete.push(message_id);
    ctx.session.state = "auth:revalidate";
  } catch (error) {
    console.error("An error occured in revalidateCmd", error);
    const { message_id } = await ctx.reply(error instanceof Error ? error.message : String(error));
    ctx.session.toDelete.push(message_id);
  }
}

async function signUpMsgHandler(ctx: Context) {
  if (!ctx.message || !("text" in ctx.message)) return;

  const text = ctx.message?.text?.trim();
  const { from, session } = ctx;
  if (!text || !from) return;
  try {
    switch (session.state) {
      case "auth:email":
        await ctx.sendChatAction("typing");
        const { error, message } = await query.put("/auth/external", {
          body: { email: text },
          headers: { Authorization: `Basic ${ctx.telegram.token}` },
        });
        if (error) {
          const { message_id } = await ctx.reply(error);
          ctx.session.toDelete.push(message_id);
          return;
        }
        if (!message) throw new Error("Message is undefined");

        cache.set(from.id.toString(), text);
        ctx.session.state = "auth:otp";
        const { message_id } = await ctx.reply(message);
        ctx.session.toDelete.push(message_id);

        break;

      case "auth:otp":
        const cachedEmail = cache.get(from.id.toString());
        if (!cachedEmail) {
          const { message_id } = await ctx.reply("Please provide an email address (An OTP will be sent to verify)", {
            reply_markup: {
              force_reply: true,
            },
          });
          ctx.session.toDelete.push(message_id);
          return;
        }

        await ctx.sendChatAction("typing");
        const { data, ...rest } = await query.patch<{ token: string }>("/auth/external", {
          body: { otp: text, email: cachedEmail, username: from.username, id: from.id.toString() },
          headers: { Authorization: `Basic ${ctx.telegram.token}` },
        });
        {
          const { message_id } = await ctx.reply(rest.message ?? rest.error ?? "An unknown error occured");
          ctx.session.toDelete.push(message_id);
        }

        if (data !== undefined) {
          ctx.session = { ...session, token: data.token, state: "idle" };
        }

        break;

      case "auth:revalidate":
        await ctx.sendChatAction("typing");
        const revalidate = await query.patch<{ token: string }>("/auth/revalidate", {
          body: { otp: text, id: from.id.toString() },
          headers: { Authorization: `Basic ${ctx.telegram.token}` },
        });
        {
          const { message_id } = await ctx.reply(revalidate.message ?? revalidate.error ?? "An unknown error occured");
          ctx.session.toDelete.push(message_id);
        }

        if (revalidate.data !== undefined) {
          ctx.session = { ...session, token: revalidate.data.token, state: "idle" };
        }

        break;

      default:
        break;
    }
  } catch (error) {}
}

export { signInCmd, signOutCmd, signUpCmd, signUpMsgHandler, revalidateCmd };
