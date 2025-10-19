import { BotCommand } from "telegraf/typings/core/types/typegram";

const botCommands: BotCommand[] = [
  {
    command: "start",
    description: "Start KooPaa and link your wallet",
  },
  {
    command: "profile",
    description: "View your linked wallet and user info",
  },
  {
    command: "help",
    description: "Show all available commands and how to use them",
  },
  {
    command: "create_group",
    description: "Create a new contribution or savings group",
  },
  {
    command: "join_group",
    description: "Join an existing group by ID or invite link",
  },
  {
    command: "my_groups",
    description: "See the list of groups you belong to",
  },
] as const;

export default botCommands;
