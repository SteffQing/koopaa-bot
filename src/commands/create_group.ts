import cache from "../db/cache";
import type { Context } from "../models/telegraf.model";
import { query } from "../utils/fetch";
import type { Balance } from "../models/db.model";
import { reset } from "../utils";
import { errorWrapper } from "../utils/helpers";

async function _createGroupCmd(ctx: Context) {
  // if (ctx.chat?.type !== "private") ; should allow creation in public groups

  const { from, session } = ctx;
  if (!from) throw new Error("No user found");
  if (!session.token) throw new Error("You need to /sign_in first.");

  await ctx.sendChatAction("typing");
  const { data, error } = await query.get<Balance>("/balance", {
    headers: { Authorization: `Bearer ${session.token}` },
  });
  await reset(ctx);

  if (error) throw error;
  if (!data) throw new Error("Failed to fetch balance");
  // FIX: This is temporary, We will sponsor fees
  if (data.solBalance < 0.001)
    throw new Error("You need at least 0.001 SOL to create a group to cover the transaction fee.");

  ctx.session.state = "create_ajo";

  const key = "create_ajo:" + from.id;
  cache.set(key, "{}");

  const { message_id } = await ctx.reply("🧱 Let's create a new group!\n\nWhat would you name your group?");
  ctx.session.toDelete.push(message_id);
}

const createGroupCmd = errorWrapper(_createGroupCmd);

export { createGroupCmd };
