import fp from "fastify-plugin";
import { session, Telegraf } from "telegraf";
import { getDefaultSession } from "../utils";
import store from "../db/sqlite3";
import type { FastifyInstance } from "fastify";
import type { Context } from "../models/telegraf.model";
import { revalidateCmd, signInCmd, signOutCmd, signUpCmd } from "../commands/auth";
import { helpCmd, startCmd } from "../commands/start";
import { profileCmd } from "../commands/profile";
import botCommands from "../commands/commands";
import { createGroupCmd } from "../commands/create_group";
import { confirmOrCancelCreateAjoCb, selectGroupCoverCb } from "../callbacks/create_group";
import { requestJoinGroupCmd } from "../commands/join_group";
import { contributeCb, getGroupInviteCodeCb, viewGroupCb } from "../callbacks/group";
import { actionRequestJoinGroupCb } from "../callbacks/join_group";
import { authMsgHdlr } from "../handlers/auth";
import { createGroupFlowHdlr } from "../handlers/create_group";
import { joinAjoGroupWithCodeHdlr } from "../handlers/join_group";
import { myGroupsCmd } from "../commands/my_groups";
import { viewMyGroupsSummaryCb } from "../callbacks/my_groups";
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
        bot.action(/^(choose_cover):(.+)$/, selectGroupCoverCb);
        bot.action(/^(create_ajo):(.+)$/, confirmOrCancelCreateAjoCb);

        // Join Ajo group Commands
        bot.command("join_group", requestJoinGroupCmd);
        bot.action(/^(invite):(.+)$/, getGroupInviteCodeCb); // from create and other inline buttons
        bot.action(/^(join_ajo):(.+)$/, actionRequestJoinGroupCb);

        // Ajo Group Commands and Callbacks
        bot.command("my_groups", myGroupsCmd);
        bot.action(/^(group_summary):(.+)$/, viewMyGroupsSummaryCb);
        bot.action(/^(group):(.+)$/, viewGroupCb);
        bot.action(/^(contribute):(.+)$/, contributeCb);
        bot.action(/^(waiting_room):(.+)$/, contributeCb);
        bot.action(/^(add_participant):(.+)$/, contributeCb);

        bot.on("message", async (ctx, next) => {
          const { state } = ctx.session;

          if (state.startsWith("auth:")) await authMsgHdlr(ctx, next);
          else if (state === "create_ajo") await createGroupFlowHdlr(ctx, next);
          else if (state === "join_ajo") await joinAjoGroupWithCodeHdlr(ctx, next);
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
