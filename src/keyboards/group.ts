import type { AjoGroupDataWithYou } from "../models/koopaa.api";
import { getInviteCodeKeyboard } from "./general";

function ajoGroupKeyboard({ group, address }: AjoGroupDataWithYou) {
  const inWaitingRoom = group.waitingRoom.map((w) => w.toLowerCase()).includes(address.toLowerCase());
  if (inWaitingRoom) return [[{ text: "Ping Admin for Approval", callback_data: `ping:${group.admin}:${group.pda}` }]];

  const isAdmin = group.admin.toLowerCase() === address.toLowerCase();

  if (!group.startTimestamp) {
    const keyboard = [];
    const [inviteCodeKeyboard] = getInviteCodeKeyboard(group.pda);
    keyboard.push(inviteCodeKeyboard!);
    if (isAdmin)
      keyboard.push([
        { text: "Waiting Room", callback_data: `waiting_room:${group.pda}` },
        { text: "Add Participant", callback_data: `add_participant:${group.pda}` },
      ]);
    return keyboard;
  }

  const you = group.participants.find((p) => p.participant.toLowerCase() === address.toLowerCase());
  if (!you) return [];

  const now = Math.floor(Date.now() / 1000);
  const elapsed = now - group.startTimestamp;
  const intervalInSeconds = group.contributionInterval * 86400;
  const currentContributionRound = Math.floor(elapsed / intervalInSeconds);

  if (currentContributionRound > you.contributionRound)
    return [[{ text: "Contribute", callback_data: `contribute:${group.pda}` }]];

  return [];
}

const waitlistRequestKeyboard = [
  [
    { text: "Accept", callback_data: `waitlist:accept` },
    { text: "Reject", callback_data: `waitlist:reject` },
  ],
];

export { ajoGroupKeyboard, waitlistRequestKeyboard };
