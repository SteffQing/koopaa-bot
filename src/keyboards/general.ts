import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

function getInviteCodeKeyboard(pda: string) {
  return [[{ text: "Get Invite Code", callback_data: `invite:${pda}` }]] as InlineKeyboardButton[][];
}

export { getInviteCodeKeyboard };
