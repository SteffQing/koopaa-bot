import { fmt, bold, italic, code, link } from "telegraf/format";
import type { CreateAjoGroupFormValues } from "../schema/create.ajo";
import type { GridAjoInit } from "../models/koopaa.api";

function formatAjoGroupSummary(v: CreateAjoGroupFormValues) {
  return fmt`🧾 ${bold("Group Creation Summary")}

🏷️ ${bold("Name:")} ${v.name}
📝 ${bold("Description:")} ${v.description}
👥 ${bold("Max Participants:")} ${v.max_participants}
💰 ${bold("Contribution Amount:")} ${v.contribution_amount} USDC
⏰ ${bold("Contribution Interval:")} ${v.contribution_interval} days
💵 ${bold("Payout Interval:")} ${v.payout_interval} days
🏷️ ${bold("Tag:")} ${v.tag}

❓ ${italic("Confirm or cancel this group creation?")}
`;
}

type GridAjoInitWithPDA = Omit<GridAjoInit, "messageId"> & { pda: string; name: string };
function formatAjoGroupCreated({ signature, name, pda }: GridAjoInitWithPDA) {
  const explorer = `https://solscan.io/tx/${signature}?cluster=devnet`;

  return fmt`🎉 ${bold("Group Created Successfully!")}

🏷️ ${bold("Name:")} ${name}
🏦 ${bold("Address:")} ${code(pda)}

🔗 ${link("View Transaction", explorer)}

${italic("Your group is now live on-chain. You can invite members and start contributions!")}
  `;
}

export { formatAjoGroupSummary, formatAjoGroupCreated };
