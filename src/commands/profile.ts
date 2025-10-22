import type { User, Balance } from "../models/db.model";
import type { Context } from "../models/telegraf.model";
import { escapeMarkdown } from "../utils";
import { query } from "../utils/fetch";

async function profileCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") return;

  try {
    const { from, session } = ctx;
    if (!from) return;

    if (!session.token) {
      const { message_id } = await ctx.reply("You need to /sign_in first.");
      ctx.session.toDelete.push(message_id);
      return;
    }

    await ctx.sendChatAction("typing");
    const { error, data: user } = await query.get<User>("/user", {
      headers: { Authorization: `Bearer ${session.token}` },
    });

    if (error) {
      const { message_id } = await ctx.reply(error);
      ctx.session.toDelete.push(message_id);
      return;
    }

    if (!user) throw new Error("User not found");

    const { message_id } = await ctx.replyWithMarkdownV2(
      `👤 *Your Profile*\n\n` +
        `📧 *Email:* ${escapeMarkdown(user.email || "N/A")}\n` +
        `💳 *Wallet:* \`${escapeMarkdown(user.address)}\`\n\n` +
        `💰 *Balances:* ${escapeMarkdown("_Loading..._")}`
    );
    ctx.session.toDelete.push(message_id);

    await ctx.sendChatAction("typing");
    const { data } = await query.get<Balance>("/public/balance", {
      params: { address: user.address },
    });

    if (!data) throw new Error("Balance not found");

    await ctx.telegram.editMessageText(
      ctx.chat.id,
      message_id,
      undefined,
      `👤 *Your Profile*\n\n` +
        `📧 *Email:* ${escapeMarkdown(user.email || "N/A")}\n` +
        `💳 *Wallet:* \`${escapeMarkdown(user.address)}\`\n\n` +
        `💰 *Balances:*\n` +
        `• SOL: *${escapeMarkdown(data.solBalance.toFixed(4))}*\n` +
        `• USDC: *${escapeMarkdown(data.usdcBalance.toFixed(2))}*`,
      { parse_mode: "MarkdownV2" }
    );
  } catch (error) {
    console.error("An error occured in profileCmd", error);
    const { message_id } = await ctx.reply("An error occurred. Please try again later.");
    ctx.session.toDelete.push(message_id);
  }
}

export { profileCmd };
