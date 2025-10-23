import { InputMediaPhoto } from "telegraf/typings/core/types/typegram";
import cache from "../db/cache";
import type { Context } from "../models/telegraf.model";
import { type CreateAjoGroupFormValues } from "../schema/create.ajo";
import {
  ContributionIntervalMarkup,
  CoverPhotoMarkup,
  PayoutIntervalMarkup,
  TagMarkup,
} from "../keyboards/create_group";
import { errorWrapper } from "../utils/helpers";

const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value)) && value !== "";
};

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

const contribution_intervals = ["Daily", "Weekly", "Monthly"];
const payout_intervals = ["Weekly", "Bi-Weekly", "Monthly"];
const tags = ["real_estate", "birthday", "finance", "lifestyle", "education", "travel"] as const;
const view_tags = ["Real Estate", "Birthday", "Finance", "Lifestyle", "Education", "Travel"];

async function _createGroupFlowHdlr(ctx: Context) {
  if (!ctx.message || !("text" in ctx.message)) throw new Error("No message");

  const text = ctx.message.text.trim();
  if (!ctx.from) throw new Error("No user found");

  const key = "create_ajo:" + ctx.from.id;
  if (!cache.has(key)) throw new Error("Please call the /create_group command to start over");

  const partial: CreateAjoGroupFormValues = JSON.parse(cache.get(key) || "{}");
  const currentStep = getNextStep(partial);
  let replyId: number | undefined;

  switch (currentStep) {
    case "name":
      if (text.length < 3 || text.length > 50) throw new Error("Please enter a name between 3 and 50 characters.");

      partial.name = text;
      replyId = (await ctx.reply("✍️ Great! Please provide a description for your group (10–500 characters)."))
        .message_id;

      break;

    case "description":
      if (text.length < 10 || text.length > 500)
        throw new Error("Please enter a description between 10 and 500 characters.");

      partial.description = text;
      replyId = (await ctx.reply("👥 How many participants do you want? (3–20)")).message_id;
      break;

    case "max_participants":
      if (!isNumeric(text)) throw new Error("Please enter a valid number of maximum participants.");
      if (Number(text) < 3 || Number(text) > 20) throw new Error("Please enter a number between 3 and 20.");

      partial.max_participants = Number(text);
      replyId = (await ctx.reply("💰 What’s the contribution amount per round (in USDC)?")).message_id;
      break;

    case "contribution_amount":
      if (!isNumeric(text)) throw new Error("Please enter a valid contribution amount.");
      if (Number(text) < 0) throw new Error("Please enter a value greater than 0.");

      partial.contribution_amount = Number(text);
      replyId = (
        await ctx.reply("⏰ How often should members contribute?", {
          reply_markup: ContributionIntervalMarkup,
        })
      ).message_id;
      break;

    case "contribution_interval":
      if (!contribution_intervals.includes(text)) {
        const { message_id } = await ctx.reply("Please select a valid contribution interval.", {
          reply_markup: ContributionIntervalMarkup,
        });
        ctx.session.toDelete.push(message_id);
        return;
      }
      const interval = text === "Daily" ? "1" : text === "Weekly" ? "7" : "30";
      partial.contribution_interval = interval;
      replyId = (
        await ctx.reply("💵 How often should payouts occur?", {
          reply_markup: PayoutIntervalMarkup,
        })
      ).message_id;
      break;

    case "payout_interval":
      if (!payout_intervals.includes(text)) {
        const { message_id } = await ctx.reply("Please select a valid payout interval.", {
          reply_markup: PayoutIntervalMarkup,
        });
        ctx.session.toDelete.push(message_id);
        return;
      }
      const payout_interval = text === "Weekly" ? "7" : text === "Bi-Weekly" ? "14" : "30";
      partial.payout_interval = payout_interval;

      replyId = (
        await ctx.reply("🏷️ Choose a tag for your group", {
          reply_markup: TagMarkup,
        })
      ).message_id;

      break;

    case "tag":
      if (!view_tags.includes(text)) {
        const { message_id } = await ctx.reply("Please select a valid tag.", {
          reply_markup: TagMarkup,
        });
        ctx.session.toDelete.push(message_id);
        return;
      }
      const tag = tags[view_tags.indexOf(text)];
      partial.tag = tag as (typeof tags)[number];

      replyId = (await ctx.reply("🖼️ Pick a cover photo for your group:")).message_id;

      const base = "https://app.koopaa.fun/group-cover";
      const photos: InputMediaPhoto[] = Array.from({ length: 4 }, (_, i) => ({
        type: "photo",
        media: `${base}/${i + 1}.png`,
        caption: i === 0 ? "Select a cover photo below 👇" : "",
      }));

      const media = await ctx.sendMediaGroup(photos);
      const msgId = media.map((m) => m.message_id);

      const { message_id } = await ctx.reply("Which cover do you want to use?", {
        reply_markup: CoverPhotoMarkup,
      });

      ctx.session.toDelete.push(...msgId, message_id);
      break;

    default:
      break;
  }
  ctx.session.toDelete.push(ctx.message.message_id);
  if (replyId) ctx.session.toDelete.push(replyId);

  cache.set(key, JSON.stringify(partial));
}

const createGroupFlowHdlr = errorWrapper(_createGroupFlowHdlr);

export { createGroupFlowHdlr };
