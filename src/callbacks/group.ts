import type { Context } from "../models/telegraf.model";
import { query } from "../utils/fetch";
import { AjoGroupDataWithYou } from "../models/koopaa.api";
import { formatAjoGroupData } from "../messages/group";
import { ajoGroupKeyboard } from "../keyboards/group";
import { errorWrapper, getApiData } from "../utils/helpers";
import { formatInviteCodeGenerated } from "../messages/general";

async function _viewGroupCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.from) throw new Error("Invalid callback query");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  const [, pda] = ctx.callbackQuery.data.split(":");
  if (!pda) throw new Error("No pda in callback 🫣");
  if (!ctx.session.token) throw new Error("You need to /sign_in first.");

  await ctx.sendChatAction("typing");
  const { data, error } = await query.get<AjoGroupDataWithYou>(`/group/${pda}/group-data`, {
    headers: { Authorization: ctx.session.token },
  });

  const { group, address } = getApiData(error, data);
  await ctx.answerCbQuery();

  const msg = formatAjoGroupData(group);
  const keyboard = ajoGroupKeyboard({ group, address });
  await ctx.reply(msg, {
    reply_markup: { inline_keyboard: keyboard },
  });
}

async function _getGroupInviteCodeCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) throw new Error("Invalid callback query");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  const [, pda] = ctx.callbackQuery.data.split(":");
  if (!pda) throw new Error("No pda in callback 🫣");
  if (!ctx.session.token) throw new Error("You need to /sign_in first.");

  await ctx.sendChatAction("typing");
  const { data, error, message } = await query.put<string>("/invite", {
    body: { pda },
    headers: { Authorization: `Bearer ${ctx.session.token}` },
  });

  if (error) throw error;
  if (!data || !message) throw new Error("Error occured when generating the invite code");

  await ctx.reply(formatInviteCodeGenerated(message, data));
}

const viewGroupCb = errorWrapper(_viewGroupCb);
const getGroupInviteCodeCb = errorWrapper(_getGroupInviteCodeCb);

export { viewGroupCb, getGroupInviteCodeCb };
