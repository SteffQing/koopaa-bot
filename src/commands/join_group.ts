import { Balance } from "../models/db.model";
import { Context } from "../models/telegraf.model";
import { reset } from "../utils";
import { query } from "../utils/fetch";
import { errorWrapper, getApiData } from "../utils/helpers";

async function _requestJoinGroupCmd(ctx: Context) {
  if (!ctx.session.token) throw new Error("You need to /sign_in first.");
  await reset(ctx);

  // FIX: Temporary, till we sort fee payment for users
  const { data, error } = await query.get<Balance>("/balance", {
    headers: { Authorization: `Bearer ${ctx.session.token}` },
  });

  console.log("balance queried", data);

  const { solBalance } = getApiData(error, data);
  if (solBalance < 0.001) throw new Error("0.001 SOL needed to cover the transaction fee.");

  ctx.session.state = "join_ajo";
  const { message_id } = await ctx.reply(
    "Please enter your invite code to join an ajo group (request it from the group creator or other members)",
    { reply_markup: { force_reply: true } }
  );
  ctx.session.toDelete.push(message_id);
}

const requestJoinGroupCmd = errorWrapper(_requestJoinGroupCmd);

export { requestJoinGroupCmd };
