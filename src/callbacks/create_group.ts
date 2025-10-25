import cache from "../db/cache";
import type { Context } from "../models/telegraf.model";
import { createAjoGroupSchema, type CreateAjoGroupFormValues } from "../schema/create.ajo";
import { query } from "../utils/fetch";
import { formatAjoGroupCreationSummary, formatAjoGroupCreatedMessage } from "../messages/create_group";
import { reset } from "../utils";
import type { GridAjoInit } from "../models/koopaa.api";
import { errorWrapper, getApiData } from "../utils/helpers";
import { ConfirmGroupCreate } from "../keyboards/create_group";
import { getInviteCodeKeyboard } from "../keyboards/general";

async function _selectGroupCoverCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.from) throw new Error("No data in callback");

  const key = "create_ajo:" + ctx.from.id;
  if (!cache.has(key)) throw new Error("Group data is missing or expired. Please start again");
  const partial: CreateAjoGroupFormValues = JSON.parse(cache.get(key) || "{}");

  const [, cover] = ctx.callbackQuery.data.split(":");
  const coverNum = Number(cover);
  if (!coverNum || coverNum < 1 || coverNum > 4) throw new Error("Invalid cover selected.");

  partial.group_cover_photo = coverNum;
  cache.set(key, JSON.stringify(partial));
  await ctx.answerCbQuery("✅ Cover photo selected!");

  const parsed = createAjoGroupSchema.safeParse(partial);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((e) => `- ${e.message}`).join("\n");
    const { message_id } = await ctx.reply(`❌ Invalid input:\n${errors}\n\nPlease restart with /create_group`);
    cache.delete(key);
    ctx.session.toDelete.push(message_id);
    return;
  }

  const summary = formatAjoGroupCreationSummary(parsed.data);
  const { message_id } = await ctx.reply(summary, {
    reply_markup: {
      inline_keyboard: ConfirmGroupCreate,
    },
  });
  ctx.session.msgId = message_id;
}

async function _confirmOrCancelCreateAjoCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.from) throw new Error("Invalid callback query");
  const [, action] = ctx.callbackQuery.data.split(":");

  const key = "create_ajo:" + ctx.from.id;
  if (!cache.has(key)) throw new Error("Group data is lost or expired. Please restart with /create_group.");

  const partial: CreateAjoGroupFormValues = JSON.parse(cache.get(key) || "{}");

  await reset(ctx);

  if (action === "confirm") {
    await ctx.answerCbQuery("Confirming group creation 💫");
    const createAjo = createAjoGroupSchema.parse(partial);

    await ctx.sendChatAction("typing");
    const { data, error } = await query.post<GridAjoInit>("/grid", {
      body: createAjo,
      headers: { Authorization: `Bearer ${ctx.session.token}` },
    });

    const apiData = getApiData(error, data);
    const message = formatAjoGroupCreatedMessage({ ...apiData, name: partial.name });
    const { message_id } = await ctx.reply(message, {
      reply_markup: { inline_keyboard: getInviteCodeKeyboard(apiData.pda) },
    });
    ctx.session.msgId = message_id;
  } else if (action === "cancel") {
    await ctx.answerCbQuery("Ajo group creation cancelled.");
  }
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  cache.delete(key);
  // if (msgId) await ctx.telegram.editMessageReplyMarkup(ctx.chat!.id, msgId, undefined, undefined);
}

const selectGroupCoverCb = errorWrapper(_selectGroupCoverCb);
const confirmOrCancelCreateAjoCb = errorWrapper(_confirmOrCancelCreateAjoCb);

export { selectGroupCoverCb, confirmOrCancelCreateAjoCb };
