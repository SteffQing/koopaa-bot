import { fmt, bold, italic, code, link } from "telegraf/format";
import type { AjoGroupData, AjoGroupDataWithYou } from "../models/koopaa.api";

function formatAjoGroupData(v: AjoGroupData) {
  const explorer = `https://solscan.io/tx/${v.pda}?cluster=devnet`;
  return fmt`🧾 ${bold("Ajo Group Info")}

🏷️ ${bold("Name:")} ${v.name}
📝 ${bold("Description:")} ${v.description}
👥 ${bold("Participants:")} ${v.participants.length}/${v.numParticipants} (${v.waitingRoom.length} in waiting room)
💰 ${bold("Contribution Amount:")} ${v.contributionAmount} USDC
⏰ ${bold("Contribution Interval:")} ${v.contributionInterval} days
💵 ${bold("Payout Interval:")} ${v.payoutInterval} days
🏷️ ${bold("Tag:")} ${v.tag}

Ajo Group PDA -> ${code(v.pda)}
${italic("You can view onchain, the actions occuring on this Ajo group with its PDA/Address")}
🔗 ${link("View on Solscan", explorer)}
`;
}

function ajoGroupKeyboard({ group, address }: AjoGroupDataWithYou) {
  const inWaitingRoom = group.waitingRoom.map((w) => w.toLowerCase()).includes(address.toLowerCase());
  if (inWaitingRoom) return [[{ text: "Ping Admin for Approval", callback_data: `ping:${group.admin}:${group.pda}` }]];

  if (!group.startTimestamp) return [[{ text: "Generate Invite Code", callback_data: `invite:${group.pda}` }]];

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

export { formatAjoGroupData, ajoGroupKeyboard };
