import cache from "../db/cache";
import type { Context } from "../models/telegraf.model";
import { query } from "../utils/fetch";
import { errorWrapper, getApiData } from "../utils/helpers";

async function _authMsgHdlr(ctx: Context) {
  if (!ctx.message || !("text" in ctx.message)) throw new Error("No message");
  const text = ctx.message.text.trim();

  const { from, session } = ctx;
  if (!from) throw new Error("No user found");

  let replyId: number | undefined;

  switch (session.state) {
    case "auth:email":
      await ctx.sendChatAction("typing");
      const { error, message } = await query.put("/auth/external", {
        body: { email: text },
        headers: { Authorization: `Basic ${ctx.telegram.token}` },
      });

      if (error) throw error;
      if (!message) throw new Error("Message is undefined");

      cache.set("email_" + from.id, text);
      ctx.session.state = "auth:otp";

      replyId = (await ctx.reply(message)).message_id;
      break;

    case "auth:otp":
      const cachedEmail = cache.get("email_" + from.id);
      if (!cachedEmail) throw new Error("Please provide an email address (An OTP will be sent to verify)");

      await ctx.sendChatAction("typing");
      const { data, ...rest } = await query.patch<{ token: string }>("/auth/external", {
        body: { otp: text, email: cachedEmail, username: from.username, id: from.id.toString() },
        headers: { Authorization: `Basic ${ctx.telegram.token}` },
      });

      if (!rest.message) throw new Error("Malformed API response");
      const { token } = getApiData(rest.error, data);

      cache.delete("email_" + from.id);
      replyId = (await ctx.reply(rest.message)).message_id;

      ctx.session = { ...session, token, state: "idle" };
      break;

    case "auth:revalidate":
      await ctx.sendChatAction("typing");
      const revalidate = await query.patch<{ token: string }>("/auth/revalidate", {
        body: { otp: text, id: from.id.toString() },
        headers: { Authorization: `Basic ${ctx.telegram.token}` },
      });

      if (!revalidate.message) throw new Error("Malformed API response");
      const revalidateData = getApiData(revalidate.error, revalidate.data);

      replyId = (await ctx.reply(revalidate.message)).message_id;
      ctx.session = { ...session, token: revalidateData.token, state: "idle" };
      break;

    default:
      throw new Error("Authentication state invalid");
  }

  if (replyId) ctx.session.toDelete.push(replyId);
}

const authMsgHdlr = errorWrapper(_authMsgHdlr);

export { authMsgHdlr };
