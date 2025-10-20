import { fmt, bold, italic } from "telegraf/format";
import type { CreateAjoGroupFormValues } from "../schema/create.ajo";

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

export { formatAjoGroupSummary };
