import fp from "fastify-plugin";
import { session, Telegraf } from "telegraf";
import { getDefaultSession } from "../utils";
import store from "../db/sqlite3";
import type { FastifyInstance } from "fastify";
import type { Context } from "../models/telegraf.model";
import { signInCmd, signOutCmd, signUpCmd, signUpMsgHandler } from "../commands/auth";
import { helpCmd, startCmd } from "../commands/start";
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

        bot.on("message", async (ctx, next) => {
          const { state } = ctx.session;
          if (state.startsWith("auth:")) await signUpMsgHandler(ctx);
          // else if (state.startsWith("trade:")) await tradeMessageHandler(ctx);
          return await next();
        });

        // bot.action(/close_(.+)/, closeTicketCallback);
        // bot.action(/reply_(.+)/, replyTicketCallback);

        bot.launch(() => console.log("Bot is running..."));
        // const webhookPath = "/telegram";
        // const webhookUrl = `${WEBHOOK_URL}${webhookPath}`;

        // await bot.telegram.setWebhook(webhookUrl);

        // fastify.post(webhookPath, async (request, reply) => {
        //   await bot.handleUpdate(request.body as Update);
        //   return reply.send({ ok: true });
        // });

        fastify.decorate("bot", bot);
      },
      {
        name: "hawk-trading-bot",
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
