import { requestJoinGroupKeyboard } from "../keyboards/my_group";
import { formatAjoGroupSummary } from "../messages/join_group";
import { AjoGroupData } from "../models/koopaa.api";
import { Context } from "../models/telegraf.model";
import { reset } from "../utils";
import { query } from "../utils/fetch";
import { errorWrapper, getApiDataWithMessage } from "../utils/helpers";

async function _joinAjoGroupWithCodeHdlr(ctx: Context) {
  if (!ctx.message || !("text" in ctx.message)) throw new Error("No message");
  if (!ctx.session.token) throw new Error("You need to /sign_in first.");

  const text = ctx.message.text.trim();

  await reset(ctx, true);
  const { data, error, message } = await query.get<AjoGroupData>("/invite", {
    headers: { Authorization: `Bearer ${ctx.session.token}` },
    params: { code: text },
  });

  const { msg, apiData } = getApiDataWithMessage(error, data, message);

  const reply = formatAjoGroupSummary(apiData, msg);
  const { message_id } = await ctx.reply(reply, {
    reply_markup: {
      inline_keyboard: requestJoinGroupKeyboard(apiData.pda),
    },
  });
  ctx.session.msgId = message_id;
}

const joinAjoGroupWithCodeHdlr = errorWrapper(_joinAjoGroupWithCodeHdlr);

export { joinAjoGroupWithCodeHdlr };
