import cache from "../db/cache";
import type { Context } from "../models/telegraf.model";
import { createAjoGroupSchema, type CreateAjoGroupFormValues } from "../schema/create.ajo";
import { query } from "../utils/fetch";
import { formatAjoGroupCreated, formatAjoGroupSummary } from "../handlers/group.message";
import { reset } from "../utils";
import type { GridAjoSetup } from "../models/koopaa.api";

async function selectedCoverCallback(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.callbackQuery.data || !ctx.from) return;

  const key = "create_ajo:" + ctx.from.id;
  if (!cache.has(key)) return;
  const partial: CreateAjoGroupFormValues = JSON.parse(cache.get(key) || "{}");
  try {
    const [, cover] = ctx.callbackQuery.data.split(":");
    const coverNum = Number(cover);
    if (!coverNum || coverNum < 1 || coverNum > 4) {
      await ctx.answerCbQuery("Invalid cover selected.", { show_alert: true });
      return;
    }

    await ctx.answerCbQuery();

    partial.group_cover_photo = coverNum;
    cache.set(key, JSON.stringify(partial));
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
    ctx.session.toDelete.push(message_id);
  } catch (error) {
    console.error(error);
    await ctx.answerCbQuery("An error occurred.");
  }
}

async function confirmOrCancelCreateAjoCallback(ctx: Context) {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery) || !ctx.callbackQuery.data || !ctx.from) return;

  const key = "create_ajo:" + ctx.from.id;
  try {
    if (!cache.has(key)) throw new Error("No group data found");
    const partial: CreateAjoGroupFormValues = JSON.parse(cache.get(key) || "{}");
    const [, action] = ctx.callbackQuery.data.split(":");

    await reset(ctx);
    await ctx.answerCbQuery().catch(() => {});

    if (action === "confirm") {
      const parsed = createAjoGroupSchema.safeParse(partial);
      if (!parsed.success) throw new Error("Invalid input");

      await ctx.sendChatAction("upload_document");
      const { data, error } = await query.post<GridAjoSetup>("/grid", {
        body: parsed.data,
        headers: { Authorization: `Bearer ${ctx.session.token}` },
      });

      if (error) throw error;
      if (!data) throw new Error("Failed to create ajo group");

      const message = formatAjoGroupCreated({ ...data, messageId: partial.name });
      const { message_id } = await ctx.reply(message);
      ctx.session.toDelete.push(message_id);
    } else if (action === "cancel") {
      const { message_id } = await ctx.reply("Ajo group creation cancelled.");
      ctx.session.toDelete.push(message_id);
    }

    cache.delete(key);
  } catch (error) {
    console.error(error);
    await ctx.answerCbQuery(error instanceof Error ? error.message : "An error occurred.", { show_alert: true });
  }
}

export { selectedCoverCallback, confirmOrCancelCreateAjoCallback };
