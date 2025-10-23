import type { Context } from "../models/telegraf.model";
import { query } from "../utils/fetch";
import cache from "../db/cache";
import type { MyGroupsSummary } from "../models/mygroup.model";
import { myGroupSummarySelectViewKeyboard } from "../keyboards/my_group";
import { formatMyGroupsSummary } from "../messages/my_groups";
import { getApiData, errorWrapper } from "../utils/helpers";

async function _myGroupsCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") throw new Error("This command is only available in private chats");
  const { session, from } = ctx;
  if (!from) throw new Error("No user found 🫣");

  if (!session.token) throw new Error("You need to sign in first.");

  await ctx.sendChatAction("typing");
  const { data, error } = await query.get<MyGroupsSummary>("/group/my-groups-summary", {
    headers: { Authorization: session.token },
  });

  const apiData = getApiData(error, data);
  const key = "my_groups_summary-" + from.id;
  cache.set(key, JSON.stringify(data));

  const msg = formatMyGroupsSummary(apiData, from.first_name);
  await ctx.reply(msg, {
    reply_markup: { inline_keyboard: myGroupSummarySelectViewKeyboard },
  });
}

const myGroupsCmd = errorWrapper(_myGroupsCmd);

export { myGroupsCmd };
