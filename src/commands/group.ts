import type { Context } from "../models/telegraf.model";
import cache from "../db/cache";
import { reset } from "../utils";
import { waitlistRequestKeyboard } from "../keyboards/group";
import { addParticipantToGroup_ } from "../handlers/group";

async function addParticipantCmd_(ctx: Context) {
  if (!ctx.message) throw new Error("No message found 🫣");
  if (!("text" in ctx.message)) throw new Error("What kinda command is this?");

  const { session, from, message } = ctx;
  const { message_id, text } = message;
  ctx.deleteMessage(message_id);

  const [, participant] = text.split(" ")[1]?.split("_") ?? [];
  if (!from) throw new Error("No user found 🫣");
  if (!session.token) throw new Error("You need to sign in first.");
  if (!participant) throw new Error("No participant provided in command");

  const key = "add-participant_" + from.id;
  if (!cache.has(key)) throw new Error("We don't have the PDA stored for this request!");

  const { approved, pda } = JSON.parse(cache.get(key) || "{}");
  if (approved) return addParticipantToGroup_(ctx, participant, "direct");

  cache.set(key, JSON.stringify({ pda, participant }));
  await reset(ctx);

  const msg = "Alright, whats left to do is quite simple: Accept or Reject the admision request 😌";
  const keyboard = {
    reply_markup: { inline_keyboard: waitlistRequestKeyboard },
  };
  if (session.msgId) await ctx.telegram.editMessageText(ctx.chat?.id, session.msgId, undefined, msg, keyboard);
  //   else await ctx.reply(msg, keyboard);
}

export { addParticipantCmd_ };
