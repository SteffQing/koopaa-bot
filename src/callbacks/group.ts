import cache from "../db/cache";
import type { Context } from "../models/telegraf.model";
import { createAjoGroupSchema, type CreateAjoGroupFormValues } from "../schema/create.ajo";
import { query } from "../utils/fetch";
import { formatAjoGroupCreated, formatAjoGroupSummary, formatPrivySigningError } from "../handlers/group.message";
import { reset } from "../utils";
import type { GridAjoSetup } from "../models/koopaa.api";

async function selectedCoverCallback(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.callbackQuery.data || !ctx.from) return;

  try {
    const key = "create_ajo:" + ctx.from.id;
    if (!cache.has(key)) throw new Error("Group data is missing or expired. Please start again");
    const partial: CreateAjoGroupFormValues = JSON.parse(cache.get(key) || "{}");

    const [, cover] = ctx.callbackQuery.data.split(":");
    const coverNum = Number(cover);
    if (!coverNum || coverNum < 1 || coverNum > 4) throw new Error("Invalid cover selected.");

    partial.group_cover_photo = coverNum;
    cache.set(key, JSON.stringify(partial));
    await ctx.answerCbQuery("✅ Cover photo selected!");

    const parsed = createAjoGroupSchema.safeParse(partial);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => `- ${e.message}`).join("\n");
      const { message_id } = await ctx.reply(`❌ Invalid input:\n${errors}\n\nPlease restart with /create_group`);
      cache.delete(key);
      ctx.session.toDelete.push(message_id);
      return;
    }

    const summary = formatAjoGroupSummary(parsed.data);
    const { message_id } = await ctx.reply(summary, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Confirm", callback_data: "create_ajo:confirm" },
            { text: "❌ Cancel", callback_data: "create_ajo:cancel" },
          ],
        ],
      },
    });
    ctx.session.msgId = message_id;
  } catch (error) {
    console.error(error);
    await ctx.answerCbQuery(error instanceof Error ? error.message : "An error occurred.", { show_alert: true });
    await reset(ctx);
  }
}

async function confirmOrCancelCreateAjoCallback(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.callbackQuery.data || !ctx.from) return;
  let firedCallback = false;

  const key = "create_ajo:" + ctx.from.id;
  try {
    if (!cache.has(key)) throw new Error("Group data is lost or expired. Please restart with /create_group.");
    const partial: CreateAjoGroupFormValues = JSON.parse(cache.get(key) || "{}");
    const [, action] = ctx.callbackQuery.data.split(":");

    await reset(ctx);

    if (action === "confirm") {
      const parsed = createAjoGroupSchema.safeParse(partial);
      if (!parsed.success) throw new Error("Invalid input");
      await ctx.answerCbQuery("Confirming group creation 💫");
      firedCallback = true;

      await ctx.sendChatAction("upload_document");
      const { data, error } = await query.post<GridAjoSetup>("/grid", {
        body: parsed.data,
        headers: { Authorization: `Bearer ${ctx.session.token}` },
      });

      if (error) throw error;
      if (!data) throw new Error("Error occured when creating ajo group. Please restart with /create_group.");

      const message = formatAjoGroupCreated({ ...data, messageId: partial.name });
      const { message_id } = await ctx.reply(message);
      ctx.session.toDelete.push(message_id);
    } else if (action === "cancel") {
      await ctx.answerCbQuery("Ajo group creation cancelled.");
      firedCallback = true;
    }

    cache.delete(key);
    await reset(ctx, true, true);
  } catch (error) {
    console.error("Error in confirmOrCancelCreateAjoCallback", error);
    const error_message = error instanceof Error ? error.message : String(error);
    if (error_message === "Privy signing error") {
      const { message_id } = await ctx.reply(formatPrivySigningError());
      return ctx.session.toDelete.push(message_id);
    } else {
      if (!firedCallback) await ctx.answerCbQuery(error_message, { show_alert: true });
      else await ctx.reply(error_message).then((m) => ctx.session.toDelete.push(m.message_id));
      await reset(ctx, false, true);
      return cache.delete(key);
    }
  }
}

export { selectedCoverCallback, confirmOrCancelCreateAjoCallback };
