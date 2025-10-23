import { fmt, bold, italic, code, link } from "telegraf/format";
import type { AjoGroupData, GridAjoSetup } from "../models/koopaa.api";

function formatAjoGroupSummary(v: AjoGroupData, msg: string) {
  return fmt`📢 ${italic(msg)}

🏷️ ${bold("Name:")} ${v.name}
📝 ${bold("Description:")} ${v.description}
👥 ${bold("Participants:")} ${v.participants.length}/${v.numParticipants} (${v.waitingRoom.length} in waiting room)
💰 ${bold("Contribution Amount:")} ${v.contributionAmount} USDC
⏰ ${bold("Contribution Interval:")} ${v.contributionInterval} days
💵 ${bold("Payout Interval:")} ${v.payoutInterval} days
🏷️ ${bold("Tag:")} ${v.tag}

❓ ${italic("Confirm or Cancel request to join this group!")}
`;
}

type GridAjoSetupWithPda = Omit<GridAjoSetup, "messageId"> & { pda: string };
function formatRequestToJoinAjoGroup({ signature, name, pda }: GridAjoSetupWithPda) {
  const explorer = `https://solscan.io/tx/${signature}?cluster=devnet`;

  return fmt`🎉 ${bold("Join Request was Successful!")}

You've successfully requested to join ${bold(name)} 🎊

🏦 ${bold("Group ID:")} ${code(pda)}
🔗 ${link("View on Solscan", explorer)}

${italic("You are now in the waiting room. You can invite members and start contributions!")}
  `;
}

export { formatAjoGroupSummary, formatRequestToJoinAjoGroup };
