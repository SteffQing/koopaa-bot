import { formatRequestToJoinAjoGroup } from "../messages/join_group";
import { GridAjoSetup } from "../models/koopaa.api";
import { Context } from "../models/telegraf.model";
import { reset } from "../utils";
import { query } from "../utils/fetch";
import { errorWrapper, getApiData } from "../utils/helpers";

async function _actionRequestJoinGroupCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.from) throw new Error("Invalid callback query");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  const [, action_or_pda] = ctx.callbackQuery.data.split(":");
  await reset(ctx);

  if (action_or_pda === "cancel") return await ctx.answerCbQuery("Request to join Ajo group is cancelled.");

  await ctx.sendChatAction("typing");
  const { data, error } = await query.put<GridAjoSetup>("/grid", {
    body: { pda: action_or_pda },
    headers: { Authorization: `Bearer ${ctx.session.token}` },
  });

  const ajoGroup = getApiData(error, data);

  await ctx.answerCbQuery("Request to join Ajo group is confirmed.");
  await ctx.reply(formatRequestToJoinAjoGroup({ ...ajoGroup, pda: action_or_pda! }));
}

const actionRequestJoinGroupCb = errorWrapper(_actionRequestJoinGroupCb);

export { actionRequestJoinGroupCb };
