import { formatUserData, formatUserDataWithBalance } from "../messages/profile";
import type { User, Balance } from "../models/db.model";
import type { Context } from "../models/telegraf.model";
import { query } from "../utils/fetch";
import { errorWrapper, getApiData } from "../utils/helpers";

async function _profileCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") throw new Error("This command is only available in private chats");

  const { from, session } = ctx;
  if (!from) throw new Error("No user found");
  if (!session.token) throw new Error("You need to /sign_in first.");

  await ctx.sendChatAction("typing");
  const { error, data } = await query.get<User>("/user", {
    headers: { Authorization: `Bearer ${session.token}` },
  });

  const user = getApiData(error, data);
  const { message_id } = await ctx.reply(formatUserData(user));

  await ctx.sendChatAction("typing");
  const { error: balanceError, data: balanceData } = await query.get<Balance>("/public/balance", {
    params: { address: user.address },
  });

  const balance = getApiData(balanceError, balanceData);
  await ctx.telegram.editMessageText(ctx.chat.id, message_id, undefined, formatUserDataWithBalance(user, balance));
}

const profileCmd = errorWrapper(_profileCmd);

export { profileCmd };
