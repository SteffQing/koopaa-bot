import fp from "fastify-plugin";
import { session, Telegraf } from "telegraf";
import { getDefaultSession } from "../utils";
import store from "../db/sqlite3";
import type { FastifyInstance } from "fastify";
import type { Context } from "../models/telegraf.model";
import { revalidateCmd, signInCmd, signOutCmd, signUpCmd, signUpMsgHandler } from "../commands/auth";
import { helpCmd, startCmd } from "../commands/start";
import { profileCmd } from "../commands/profile";
import botCommands from "../commands/commands";
import { createGroupCmd, handleCreateGroupFlow } from "../commands/create_group";
import { confirmOrCancelCreateAjoCallback, selectedCoverCallback } from "../callbacks/create_group.callback";
import {
  confirmOrCancelRequestJoinAjoCallback,
  getInviteCodeCallback,
  handleRequestJoinWithCode,
  requestJoinGroupCmd,
} from "../commands/join_group";
// import type { Update } from "telegraf/typings/core/types/typegram";

async function init(fastify: FastifyInstance) {
  const { BOT_TOKEN } = fastify.config;

  await fastify.register(
    fp<{ token: string; store: typeof store }>(
      async (fastify, opts) => {
        fastify.log.debug("Registering bot..");

        const bot = new Telegraf<Context>(opts.token);

        bot.use(
          session({
            defaultSession: getDefaultSession,
            store,
          })
        );

        bot.start(startCmd);
        bot.help(helpCmd);

        // Authentication Commands
        bot.command("sign_in", signInCmd);
        bot.command("sign_out", signOutCmd);
        bot.command("sign_up", signUpCmd);
        bot.command("revalidate", revalidateCmd);

        bot.command("profile", profileCmd);

        // Create Ajo group Commands
        bot.command("create_group", createGroupCmd);
        bot.action(/^(choose_cover):(.+)$/, selectedCoverCallback);
        bot.action(/^(create_ajo):(.+)$/, confirmOrCancelCreateAjoCallback);

        // Join Ajo group Commands
        bot.command("join_group", requestJoinGroupCmd);
        bot.action(/^(invite):(.+)$/, getInviteCodeCallback); // from create and other inline buttons
        bot.action(/^(request_join_ajo):(.+)$/, confirmOrCancelRequestJoinAjoCallback);

        bot.on("message", async (ctx, next) => {
          const { state } = ctx.session;
          if (state.startsWith("auth:")) await signUpMsgHandler(ctx);
          else if (state === "create_ajo") await handleCreateGroupFlow(ctx);
          else if (state === "join_ajo") await handleRequestJoinWithCode(ctx);
          return await next();
        });

        bot.launch(() => console.log("Bot is running..."));
        // const webhookPath = "/telegram";
        // const webhookUrl = `${WEBHOOK_URL}${webhookPath}`;

        // await bot.telegram.setWebhook(webhookUrl);

        await bot.telegram.deleteMyCommands();
        await Promise.all([
          bot.telegram.setMyCommands(botCommands, {
            scope: { type: "default" },
          }),
          bot.telegram.setMyCommands(botCommands, {
            scope: { type: "all_private_chats" },
          }),
          bot.telegram.setMyCommands(botCommands, {
            scope: { type: "all_group_chats" },
          }),
          bot.telegram.setMyCommands(botCommands, {
            scope: { type: "all_chat_administrators" },
          }),
        ]);

        // fastify.post(webhookPath, async (request, reply) => {
        //   await bot.handleUpdate(request.body as Update);
        //   return reply.send({ ok: true });
        // });

        fastify.decorate("bot", bot);
      },
      {
        name: "koopaa-bot",
      }
    ),
    {
      token: BOT_TOKEN,
      store,
    }
  );

  return fastify;
}

declare module "fastify" {
  interface FastifyInstance {
    bot: Telegraf<Context>;
  }
}

export default init;
