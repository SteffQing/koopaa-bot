import type { Context } from "../models/telegraf.model";
import { query } from "../utils/fetch";
import cache from "../db/cache";
import type { MyGroupsSummary, GroupSelectionType } from "../models/mygroup.model";
import { myGroupSelectKeyboard, myGroupSummarySelectViewKeyboard } from "../keyboards/my_group";
import { formatMyGroupsSummary, formatGroupSummary } from "../messages/my_groups";

async function myGroupsCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") return;
  const { session, from } = ctx;
  if (!from) return;

  try {
    if (!session.token) {
      const { message_id } = await ctx.reply("You need to sign in first.");
      ctx.session.toDelete.push(message_id);
      return;
    }

    await ctx.sendChatAction("typing");
    const { data, error, message } = await query.get<MyGroupsSummary>("/group/my-groups-summary", {
      headers: { Authorization: session.token },
    });
    if (error) throw error;
    if (!data || !message) throw new Error("Error fetching groups summary");

    cache.set(from.id.toString(), JSON.stringify(data));
    const msg = formatMyGroupsSummary(data, from.first_name);
    await ctx.reply(msg, {
      reply_markup: { inline_keyboard: myGroupSummarySelectViewKeyboard },
    });
  } catch (error) {
    console.error("error in myGroupsCmd", error);
  }
}

async function viewMyGroupsSummaryCallback(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.callbackQuery.data || !ctx.from) return;
  const [, selection] = ctx.callbackQuery.data.split(":") as [string, GroupSelectionType];

  const userId = ctx.from.id.toString();
  try {
    const cached = cache.get(userId);
    cache.delete(userId);
    if (!cached) throw new Error("No group summary in cache 🫣");
    await ctx.answerCbQuery();
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

    const data: MyGroupsSummary = JSON.parse(cached);
    const selectedData =
      selection === "active"
        ? data.activeGroupsIn
        : selection === "notStarted"
        ? data.notStartedGroupsIn
        : data.inWaitingRoomGroups;

    if (selectedData.length === 0) throw new Error("Nothing to see here 👀");

    const msg = formatGroupSummary(selectedData, selection);
    const keyboard = myGroupSelectKeyboard(selectedData);
    await ctx.reply(msg, {
      reply_markup: { inline_keyboard: keyboard },
    });
  } catch (error) {
    console.error("error occured in viewMyGroupsSummaryCallback", error);
    const error_message = error instanceof Error ? error.message : String(error);

    await ctx.answerCbQuery(error_message, { show_alert: true });
  }
}

export { viewMyGroupsSummaryCallback, myGroupsCmd };
