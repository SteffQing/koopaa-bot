import type { Context } from "../models/telegraf.model";
import { query } from "../utils/fetch";
import type { AjoGroupDataWithYou, GridAjo, WaitlistData } from "../models/koopaa.api";
import {
  formatAjoGroupData,
  formatAjoContributionMessage,
  addParticipantMessage,
  formatWaitlistMessage,
} from "../messages/group";
import { ajoGroupKeyboard } from "../keyboards/group";
import { errorWrapper, getApiData } from "../utils/helpers";
import { formatInviteCodeGenerated } from "../messages/general";
import cache from "../db/cache";
import { addParticipantToGroup_ } from "../handlers/group";

async function _viewGroupCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.from) throw new Error("Invalid callback query");

  const [, pda] = ctx.callbackQuery.data.split(":");
  if (!pda) throw new Error("No pda in callback 🫣");
  if (!ctx.session.token) throw new Error("You need to /sign_in first.");

  await ctx.sendChatAction("typing");
  const { data, error } = await query.get<AjoGroupDataWithYou>(`/group/${pda}/group-data`, {
    headers: { Authorization: `Bearer ${ctx.session.token}` },
  });

  const { group, address } = getApiData(error, data);
  await ctx.answerCbQuery();

  const msg = formatAjoGroupData(group);
  const keyboard = ajoGroupKeyboard({ group, address });
  await ctx.editMessageText(msg, {
    reply_markup: { inline_keyboard: keyboard },
  });
}

async function _contributeCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.from) throw new Error("Invalid callback query");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  const [, pda] = ctx.callbackQuery.data.split(":");
  if (!pda) throw new Error("No pda in callback 🫣");
  if (!ctx.session.token) throw new Error("You need to /sign_in first.");

  await ctx.sendChatAction("typing");
  const { data, error } = await query.post<GridAjo>(`/grid/${pda}`, {
    headers: { Authorization: `Bearer ${ctx.session.token}` },
  });

  const { signature } = getApiData(error, data);
  await ctx.answerCbQuery();

  const msg = formatAjoContributionMessage(signature);
  await ctx.reply(msg);
}

async function _getGroupInviteCodeCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) throw new Error("Invalid callback query");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  const [, pda] = ctx.callbackQuery.data.split(":");
  if (!pda) throw new Error("No pda in callback 🫣");
  if (!ctx.session.token) throw new Error("You need to sign in to generate code.");

  await ctx.sendChatAction("typing");
  const { data, error, message } = await query.put<string>("/invite", {
    body: { pda },
    headers: { Authorization: `Bearer ${ctx.session.token}` },
  });

  if (error) throw error;
  if (!data || !message) throw new Error("Error occured when generating the invite code");

  await ctx.answerCbQuery();
  await ctx.reply(formatInviteCodeGenerated(message, data));
}

async function _addParticipantCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.from) throw new Error("Invalid callback query");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  const [, pda] = ctx.callbackQuery.data.split(":");
  if (!pda) throw new Error("No pda in callback 🫣");
  if (!ctx.session.token) throw new Error("You need to /sign_in first.");

  await ctx.answerCbQuery();
  const key = "add-participant_" + ctx.from.id;
  cache.set(key, JSON.stringify({ pda, approved: true }));
  ctx.session.state = "add_participant";

  const { message_id } = await ctx.reply(addParticipantMessage);
  ctx.session.msgId = message_id;
}

async function _waitingRoomCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.from) throw new Error("Invalid callback query");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  const [, pda] = ctx.callbackQuery.data.split(":");
  if (!pda) throw new Error("No pda in callback 🫣");
  if (!ctx.session.token) throw new Error("You need to /sign_in first.");

  await ctx.answerCbQuery();
  await ctx.sendChatAction("typing");
  const { data, error } = await query.get<WaitlistData>(`/group/${pda}/waitlist`, {
    headers: { Authorization: `Bearer ${ctx.session.token}` },
  });

  const waitlist = getApiData(error, data);
  const message = formatWaitlistMessage(waitlist);

  const key = "add-participant_" + ctx.from.id;
  cache.set(key, JSON.stringify({ pda }));

  const { message_id } = await ctx.reply(message);
  ctx.session.toDelete.push(message_id);
}

async function _waitlistCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.from) throw new Error("Invalid callback query");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  await ctx.answerCbQuery();

  const [, action] = ctx.callbackQuery.data.split(":");

  const key = "add-participant_" + ctx.from.id;
  const { pda, participant } = JSON.parse(cache.get(key) || "{}");
  const approved = action === "accept";

  cache.set(key, JSON.stringify({ pda, approved }));
  await addParticipantToGroup_(ctx, participant, "waitlist");
}

async function _pingGroupAdminCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.from) throw new Error("Invalid callback query");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  await ctx.answerCbQuery();

  const [, pda] = ctx.callbackQuery.data.split(":");
  if (!pda) throw new Error("No pda in callback 🫣");
  if (!ctx.session.token) throw new Error("You need to /sign_in first.");

  await ctx.sendChatAction("typing");
  const { message, error } = await query.post(`/ping`, {
    headers: { Authorization: `Bearer ${ctx.session.token}` },
    body: { pda },
  });

  if (error) throw error;

  await ctx.answerCbQuery();
  await ctx.reply(message || "Something went wrong 🫣");
}

const viewGroupCb = errorWrapper(_viewGroupCb);
const getGroupInviteCodeCb = errorWrapper(_getGroupInviteCodeCb);
const contributeCb = errorWrapper(_contributeCb);
const addParticipantCb = errorWrapper(_addParticipantCb);
const waitingRoomCb = errorWrapper(_waitingRoomCb);
const waitlistCb = errorWrapper(_waitlistCb);
const pingGroupAdminCb = errorWrapper(_pingGroupAdminCb);

export {
  viewGroupCb,
  getGroupInviteCodeCb,
  contributeCb,
  addParticipantCb,
  waitingRoomCb,
  waitlistCb,
  pingGroupAdminCb,
};
