import cache from "../db/cache";
import { formatAddParticipantSuccess, formatUsersSearchMessage } from "../messages/group";
import { GridAjoSetup, Waitlist } from "../models/koopaa.api";
import { Context } from "../models/telegraf.model";
import { reset } from "../utils";
import { query } from "../utils/fetch";
import { errorWrapper, getApiData } from "../utils/helpers";

async function addParticipantToGroup_(ctx: Context, participant: string, via: "direct" | "waitlist") {
  const { session, from } = ctx;
  if (!session.token) throw new Error("You need to /sign_in first.");
  if (!from) throw new Error("No User found");

  const key = "add-participant_" + from.id;
  if (!cache.has(key)) throw new Error("Missing data in cache. Please restart the process");

  const body = JSON.parse(cache.get(key) ?? "{}");
  cache.delete(key);
  await reset(ctx);

  await ctx.sendChatAction("typing");
  const { data, error } = await query.patch<GridAjoSetup>("/grid", {
    headers: { Authorization: `Bearer ${session.token}` },
    body: { ...body, participant },
  });

  const apiData = getApiData(error, data);

  const reply = formatAddParticipantSuccess(apiData, body.approved, via);
  if (session.msgId) await ctx.telegram.editMessageText(ctx.chat?.id, session.msgId, undefined, reply);
  // else await ctx.reply(reply);
}

async function _addParticipantHdlr(ctx: Context) {
  if (!ctx.message || !("text" in ctx.message)) throw new Error("No message");
  const text = ctx.message.text.trim();
  await ctx.deleteMessage(ctx.message.message_id);

  await ctx.sendChatAction("typing");
  const { data, error } = await query.get<Waitlist[]>("", {
    headers: { Authorization: `Bearer ${ctx.session.token}` },
    params: { q: text },
  });

  const searchResults = getApiData(error, data);
  const msg = formatUsersSearchMessage(searchResults);
  if (ctx.session.msgId) await ctx.telegram.editMessageText(ctx.chat?.id, ctx.session.msgId, undefined, msg);
  // else await ctx.reply(msg);
}

const addParticipantHdlr = errorWrapper(_addParticipantHdlr);

export { addParticipantHdlr, addParticipantToGroup_ };
