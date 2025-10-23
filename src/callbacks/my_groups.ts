import type { Context } from "../models/telegraf.model";
import cache from "../db/cache";
import type { MyGroupsSummary, GroupSelectionType } from "../models/mygroup.model";
import { myGroupSelectKeyboard } from "../keyboards/my_group";
import { formatGroupSummary } from "../messages/my_groups";
import { errorWrapper } from "../utils/helpers";

async function _viewMyGroupsSummaryCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) throw new Error("Invalid callback query");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  const [, selection] = ctx.callbackQuery.data.split(":") as [string, GroupSelectionType];
  if (!ctx.from) throw new Error("No user found 🫣");

  const key = "my_groups_summary-" + ctx.from.id;
  if (!cache.has(key)) throw new Error("No group summary in cache 🫣");

  const cached = cache.get(key);
  cache.delete(key);

  await ctx.answerCbQuery();

  const data: MyGroupsSummary = JSON.parse(cached!);
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
}

const viewMyGroupsSummaryCb = errorWrapper(_viewMyGroupsSummaryCb);

export { viewMyGroupsSummaryCb };
