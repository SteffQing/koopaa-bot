import { formatRequestToJoinAjoGroup } from "../messages/join_group";
import { GridAjoSetup } from "../models/koopaa.api";
import { Context } from "../models/telegraf.model";
import { reset } from "../utils";
import { query } from "../utils/fetch";
import { errorWrapper, getApiData } from "../utils/helpers";

async function _actionRequestJoinGroupCb(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.from) throw new Error("Invalid callback query");
  await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

  const [, action, pda] = ctx.callbackQuery.data.split(":");
  await reset(ctx);

  if (action === "confirm") {
    await ctx.sendChatAction("typing");
    const { data, error } = await query.put<GridAjoSetup>("/grid", {
      body: { pda },
      headers: { Authorization: `Bearer ${ctx.session.token}` },
    });

    const ajoGroup = getApiData(error, data);

    await ctx.answerCbQuery("Request to join Ajo group is confirmed.");
    await ctx.reply(formatRequestToJoinAjoGroup({ ...ajoGroup, pda: pda! }));
  } else if (action === "cancel") {
    await ctx.answerCbQuery("Request to join Ajo group is cancelled.");
  }
}

const actionRequestJoinGroupCb = errorWrapper(_actionRequestJoinGroupCb);

export { actionRequestJoinGroupCb };
