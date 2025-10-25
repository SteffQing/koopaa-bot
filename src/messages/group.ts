import { fmt, bold, italic, code, link, join } from "telegraf/format";
import type { AjoGroupData, GridAjoSetup, Waitlist, WaitlistData } from "../models/koopaa.api";

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

function formatAjoContributionMessage(sig: string) {
  return fmt`🧾 ${bold("Ajo Group Contribution")}
  
Your contribution has been successfully recorded on-chain ✅

You can view it on Solscan:
${link("🔗 View Transaction", `https://solscan.io/tx/${sig}`)}
`;
}

const addParticipantMessage = fmt`
👥 ${bold("Add a Participant")}

Please enter one of the following to search and add someone to the group:

• Their ${italic("name")} — e.g. ${code("Steven Tomi")}
• Their ${italic("wallet address")} — e.g. ${code("7GvP...F32")}
• Their ${italic("email")} — e.g. ${code("someone@email.com")}
• Their ${italic("Telegram ID")} — e.g. ${code("91939402")}

Once you send any of these, I’ll look them up and share so you can add
`;

function formatAddParticipantSuccess(
  { name: groupName, signature }: GridAjoSetup,
  added: boolean,
  via: "direct" | "waitlist"
) {
  const headline = (() => {
    switch (via) {
      case "direct":
        return `💫 Participant Added to ${groupName}!`;
      case "waitlist":
        return added
          ? `💫 Participant Moved from Waitlist in ${groupName}!`
          : `🚫 Participant Removed from Waitlist in ${groupName}!`;
    }
  })();

  const description = (() => {
    switch (via) {
      case "direct":
        return `You have successfully added a participant to the group ✅`;
      case "waitlist":
        return added
          ? `You have successfully moved a participant from the waitlist and added to the group ✅`
          : `You have successfully removed a participant from the waitlist ✅`;
    }
  })();

  return fmt`
${bold(headline)}

${description}

You can view the transaction on Solscan:
${link("🔗 View Transaction", `https://solscan.io/tx/${signature}`)}
  `;
}

const url = "https://t.me/koopaa_bot?start=add_";

function formatWaitlistMessage({ waitlist, name }: WaitlistData) {
  const waitlist_msg = waitlist.map((w) => fmt`• ${link(w.username ?? "Anon", url + w.address)}`);
  return fmt`👥 ${bold(name)} Waitlist

${
  waitlist.length
    ? "These users are waiting to join your group. Tap a name to review:"
    : "There are no users in the waitlist. Start by adding participants or sharing your invite code"
}

${join(waitlist_msg, "\n")}`;
}

function formatUsersSearchMessage(waitlist: Waitlist[]) {
  const waitlist_msg = waitlist.map((w) => fmt`${link(w.username ?? "Anon", url + w.address)}`);
  return fmt`👥 ${bold("Search Result")}

${
  waitlist.length
    ? "Found the following users matching your query. Tap a name to review:"
    : "There are no users matching your search query. "
}

${join(waitlist_msg, "\n")}`;
}

export {
  formatAjoGroupData,
  formatAjoContributionMessage,
  addParticipantMessage,
  formatAddParticipantSuccess,
  formatWaitlistMessage,
  formatUsersSearchMessage,
};
