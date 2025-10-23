import type { Context } from "../models/telegraf.model";
import { query } from "../utils/fetch";
import { AjoGroupDataWithYou } from "../models/koopaa.api";
import { formatAjoGroupData } from "../messages/group.message";
import { ajoGroupKeyboard } from "../keyboards/group.keyboard";

async function viewGroupCallback(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.callbackQuery.data || !ctx.from) return;
  const [, pda] = ctx.callbackQuery.data.split(":");

  try {
    if (!pda) throw new Error("No pda in callback 🫣");
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

    if (!ctx.session.token) {
      const { message_id } = await ctx.reply("You need to /sign_in first.");
      ctx.session.toDelete.push(message_id);
      return;
    }

    await ctx.sendChatAction("typing");
    const { data, error } = await query.get<AjoGroupDataWithYou>(`/group/${pda}/group-data`, {
      headers: { Authorization: ctx.session.token },
    });

    if (error) throw error;
    if (!data) throw new Error("No data in ajo group query!");

    await ctx.answerCbQuery();

    const msg = formatAjoGroupData(data.group);
    const keyboard = ajoGroupKeyboard(data);
    await ctx.reply(msg, {
      reply_markup: { inline_keyboard: keyboard },
    });
  } catch (error) {
    console.error("error occured in viewMyGroupsSummaryCallback", error);
    const error_message = error instanceof Error ? error.message : String(error);

    await ctx.answerCbQuery(error_message, { show_alert: true });
  }
}

export { viewGroupCallback };
