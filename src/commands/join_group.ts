import { privySigningError } from "../handlers/error.messages";
import {
  formatAjoGroupSummary,
  formatInviteCodeGenerated,
  formatRequestToJoinAjoGroup,
} from "../handlers/join_group.message";
import { Balance } from "../models/db.model";
import { AjoGroupData, GridAjoSetup } from "../models/koopaa.api";
import { Context } from "../models/telegraf.model";
import { reset } from "../utils";
import { query } from "../utils/fetch";

async function getInviteCodeCallback(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.callbackQuery.data) return;
  const [, pda] = ctx.callbackQuery.data.split(":");
  if (ctx.session.msgId) {
    await ctx.telegram.editMessageReplyMarkup(ctx.chat!.id, ctx.session.msgId, undefined, undefined);
    ctx.session.msgId = undefined;
  }

  try {
    await ctx.sendChatAction("typing");
    const { data, error, message } = await query.put<string>("/invite", {
      body: { pda },
      headers: { Authorization: `Bearer ${ctx.session.token}` },
    });

    if (error) throw error;
    if (!data || !message) throw new Error("Error occured when generating the invite code");

    await ctx.reply(formatInviteCodeGenerated(message, data));
  } catch (error) {
    console.error("Error in getInviteCodeCallback", error);
    const error_message = error instanceof Error ? error.message : String(error);

    await ctx.answerCbQuery(error_message, { show_alert: true });
  }
}

async function requestJoinGroupCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") return;

  try {
    if (!ctx.session.token) {
      const { message_id } = await ctx.reply("You need to sign in first.");
      ctx.session.toDelete.push(message_id);
      return;
    }

    await reset(ctx);
    const { data, error } = await query.get<Balance>("/balance", {
      headers: { Authorization: `Bearer ${ctx.session.token}` },
    });

    if (error) throw error;
    if (!data) throw new Error("Failed to fetch balance");
    if (data.solBalance < 0.001)
      throw new Error("You need at least 0.001 SOL to join a group to cover the transaction fee.");

    ctx.session.state = "join_ajo";
    const { message_id } = await ctx.reply(
      "Please enter your invite code to join an ajo group (request it from the group creator or other members)",
      { reply_markup: { force_reply: true } }
    );
    ctx.session.toDelete.push(message_id);
  } catch (error) {
    console.error("error in requestJoinGroupCmd", error);
    const { message_id } = await ctx.reply(
      (error instanceof Error ? error.message : String(error)) + "\n\nTry again with /join_group."
    );
    ctx.session.toDelete.push(message_id);
  }
}

async function handleRequestJoinWithCode(ctx: Context) {
  if (!ctx.message || !("text" in ctx.message)) return;

  const text = ctx.message?.text?.trim();
  if (!text) return;

  try {
    if (!ctx.session.token) {
      const { message_id } = await ctx.reply("You need to sign in first.");
      ctx.session.toDelete.push(message_id);
      return;
    }

    await reset(ctx, true);
    const { data, error, message } = await query.get<AjoGroupData>("/invite", {
      headers: { Authorization: `Bearer ${ctx.session.token}` },
      params: { code: text },
    });

    if (error) throw error;
    if (!data || !message) throw new Error("Failed to query data");

    const msg = formatAjoGroupSummary(data, message);
    const { message_id } = await ctx.reply(msg, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Confirm", callback_data: `request_join_ajo:confirm:${data.pda}` },
            { text: "❌ Cancel", callback_data: "request_join_ajo:cancel" },
          ],
        ],
      },
    });
    ctx.session.msgId = message_id;
  } catch (error) {
    console.error("error in handleRequestJoinWithCode", error);
    const { message_id } = await ctx.reply(error instanceof Error ? error.message : String(error));
    ctx.session.toDelete.push(message_id);
  }
}

async function confirmOrCancelRequestJoinAjoCallback(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.callbackQuery.data || !ctx.from) return;
  const msgId = ctx.session.msgId;
  try {
    const [, action, pda] = ctx.callbackQuery.data.split(":");
    await reset(ctx);

    if (action === "confirm") {
      await ctx.sendChatAction("typing");
      const { data, error } = await query.put<GridAjoSetup>("/grid", {
        body: { pda },
        headers: { Authorization: `Bearer ${ctx.session.token}` },
      });

      if (error) throw error;
      if (!data) throw new Error("Error occured when joining ajo group. Please restart with /create_group.");

      await ctx.answerCbQuery("Request to join Ajo group is confirmed.");
      await ctx.reply(formatRequestToJoinAjoGroup({ ...data, pda: pda! }));
    } else if (action === "cancel") {
      await ctx.answerCbQuery("Request to join Ajo group is cancelled.");
    }

    if (msgId) await ctx.telegram.editMessageReplyMarkup(ctx.chat!.id, msgId, undefined, undefined);
  } catch (error) {
    console.error("Error in confirmOrCancelRequestJoinAjoCallback", error);
    const error_message = error instanceof Error ? error.message : String(error);
    if (error_message === "Privy signing error") {
      const { message_id } = await ctx.reply(privySigningError);
      return ctx.session.toDelete.push(message_id);
    } else {
      if (msgId) await ctx.telegram.editMessageReplyMarkup(ctx.chat!.id, msgId, undefined, undefined);
      return await ctx.answerCbQuery(error_message, { show_alert: true });
    }
  }
}

export { getInviteCodeCallback, requestJoinGroupCmd, handleRequestJoinWithCode, confirmOrCancelRequestJoinAjoCallback };
