import { InputMediaPhoto } from "telegraf/typings/core/types/typegram";
import cache from "../db/cache";
import type { Context } from "../models/telegraf.model";
import { type CreateAjoGroupFormValues } from "../schema/create.ajo";
import { query } from "../utils/fetch";
import type { Balance } from "../models/db.model";
import { reset } from "../utils";
import {
  ContributionIntervalMarkup,
  CoverPhotoMarkup,
  PayoutIntervalMarkup,
  TagMarkup,
} from "../handlers/new_group.keyboard";

const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value)) && value.trim() !== "";
};

async function createGroupCmd(ctx: Context) {
  if (ctx.chat?.type !== "private") return;

  const { from, session } = ctx;
  if (!from) return;
  const key = "create_ajo:" + from.id;

  try {
    if (!session.token) {
      const { message_id } = await ctx.reply("You need to /sign_in first.");
      ctx.session.toDelete.push(message_id);
      return;
    }

    await ctx.sendChatAction("typing");
    const { data, error } = await query.get<Balance>("/balance", {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    await reset(ctx);

    if (error) throw error;
    if (!data) throw new Error("Failed to fetch balance");
    if (data.solBalance < 0.001)
      throw new Error("You need at least 0.001 SOL to create a group to cover the transaction fee.");

    ctx.session.state = "create_ajo";
    cache.set(key, "{}");
    const { message_id } = await ctx.reply("🧱 Let's create a new group!\n\nWhat would you name your group?");
    ctx.session.toDelete.push(message_id);
  } catch (error) {
    console.error("error in createGroupCmd", error);
    const { message_id } = await ctx.reply(
      (error instanceof Error ? error.message : String(error)) + "\n\nTry again with /create_group."
    );
    ctx.session.toDelete.push(message_id);
    ctx.session.state = "idle";
    cache.delete(key);
  }
}

const CREATE_AJO_STEPS: (keyof CreateAjoGroupFormValues)[] = [
  "name",
  "description",
  "max_participants",
  "contribution_amount",
  "contribution_interval",
  "payout_interval",
  "tag",
  "group_cover_photo",
];

function getNextStep(data: Partial<CreateAjoGroupFormValues>) {
  return CREATE_AJO_STEPS.find((key) => data[key] === undefined || data[key] === null);
}

async function handleCreateGroupFlow(ctx: Context) {
  if (!ctx.message || !("text" in ctx.message)) return;

  const text = ctx.message?.text?.trim();
  if (!text || !ctx.from) return;

  const key = "create_ajo:" + ctx.from.id;
  if (!cache.has(key)) return;
  try {
    const partial: CreateAjoGroupFormValues = JSON.parse(cache.get(key) || "{}");
    const currentStep = getNextStep(partial);

    switch (currentStep) {
      case "name":
        {
          if (text.trim().length < 3 || text.trim().length > 50) {
            const { message_id } = await ctx.reply("Please enter a name between 3 and 50 characters.");
            ctx.session.toDelete.push(message_id);
            return;
          }
          partial.name = text.trim();
          const { message_id } = await ctx.reply(
            "✍️ Great! Please provide a description for your group (10–500 characters)."
          );
          ctx.session.toDelete.push(message_id);
        }
        break;

      case "description":
        {
          if (text.trim().length < 10 || text.trim().length > 500) {
            const { message_id } = await ctx.reply("Please enter a description between 10 and 500 characters.");
            ctx.session.toDelete.push(message_id);
            return;
          }
          partial.description = text.trim();
          const { message_id } = await ctx.reply("👥 How many participants do you want? (3–20)");
          ctx.session.toDelete.push(message_id);
        }
        break;

      case "max_participants":
        {
          if (!isNumeric(text)) {
            const { message_id } = await ctx.reply("Please enter a valid number of maximum participants.");
            ctx.session.toDelete.push(message_id);
            return;
          }
          if (Number(text) < 3 || Number(text) > 20) {
            const { message_id } = await ctx.reply("Please enter a number between 3 and 20.");
            ctx.session.toDelete.push(message_id);
            return;
          }
          partial.max_participants = Number(text);
          const { message_id } = await ctx.reply("💰 What’s the contribution amount per round (in USDC)?");
          ctx.session.toDelete.push(message_id);
        }
        break;

      case "contribution_amount":
        {
          if (!isNumeric(text)) {
            const { message_id } = await ctx.reply("Please enter a valid contribution amount.");
            ctx.session.toDelete.push(message_id);
            return;
          }
          if (Number(text) < 0) {
            const { message_id } = await ctx.reply("Please enter a value greater than 0.");
            ctx.session.toDelete.push(message_id);
            return;
          }
          partial.contribution_amount = Number(text);
          const { message_id } = await ctx.reply("⏰ How often should members contribute?", {
            reply_markup: ContributionIntervalMarkup,
          });
          ctx.session.toDelete.push(message_id);
        }
        break;

      case "contribution_interval":
        {
          const intervals = ["Daily", "Weekly", "Monthly"];
          if (!intervals.includes(text)) {
            const { message_id } = await ctx.reply("Please select a valid contribution interval.", {
              reply_markup: ContributionIntervalMarkup,
            });
            ctx.session.toDelete.push(message_id);
            return;
          }
          const interval = text === "Daily" ? "1" : text === "Weekly" ? "7" : "30";
          partial.contribution_interval = interval;
          const { message_id } = await ctx.reply("💵 How often should payouts occur?", {
            reply_markup: PayoutIntervalMarkup,
          });
          ctx.session.toDelete.push(message_id);
        }
        break;

      case "payout_interval":
        {
          const intervals = ["Weekly", "Bi-Weekly", "Monthly"];
          if (!intervals.includes(text)) {
            const { message_id } = await ctx.reply("Please select a valid payout interval.", {
              reply_markup: PayoutIntervalMarkup,
            });
            ctx.session.toDelete.push(message_id);
            return;
          }
          const interval = text === "Weekly" ? "7" : text === "Bi-Weekly" ? "14" : "30";
          partial.payout_interval = interval;

          const { message_id } = await ctx.reply("🏷️ Choose a tag for your group", {
            reply_markup: TagMarkup,
          });
          ctx.session.toDelete.push(message_id);
        }
        break;

      case "tag":
        {
          const tags = ["real_estate", "birthday", "finance", "lifestyle", "education", "travel"] as const;
          const view_tags = ["Real Estate", "Birthday", "Finance", "Lifestyle", "Education", "Travel"];
          if (!view_tags.includes(text)) {
            const { message_id } = await ctx.reply("Please select a valid tag.", {
              reply_markup: TagMarkup,
            });
            ctx.session.toDelete.push(message_id);
            return;
          }
          const tag = tags[view_tags.indexOf(text)];
          partial.tag = tag as (typeof tags)[number];

          const { message_id } = await ctx.reply("🖼️ Pick a cover photo for your group:");
          ctx.session.toDelete.push(message_id);

          const base = "https://app.koopaa.fun/group-cover";
          const photos: InputMediaPhoto[] = Array.from({ length: 4 }, (_, i) => ({
            type: "photo",
            media: `${base}/${i + 1}.png`,
            caption: i === 0 ? "Select a cover photo below 👇" : "",
          }));

          const media = await ctx.sendMediaGroup(photos);
          const msgId = media.map((m) => m.message_id);
          ctx.session.toDelete.push(...msgId);

          const msg = await ctx.reply("Which cover do you want to use?", {
            reply_markup: CoverPhotoMarkup,
          });
          ctx.session.toDelete.push(msg.message_id);
        }
        break;

      default:
        ctx.session.state = "idle";

        break;
    }
    ctx.session.toDelete.push(ctx.message.message_id);
    cache.set(key, JSON.stringify(partial));
  } catch (err) {
    console.error("Error in createGroupFlow:", err);
    const { message_id } = await ctx.reply("⚠️ Something went wrong. Try again with /create_group.");
    ctx.session.toDelete.push(message_id);
    ctx.session.state = "idle";
    cache.delete(key);
  }
}

export { createGroupCmd, handleCreateGroupFlow };
