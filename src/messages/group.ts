import { fmt, bold, italic, code, link } from "telegraf/format";
import type { AjoGroupData } from "../models/koopaa.api";

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

export { formatAjoGroupData };
