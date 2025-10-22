import { fmt, bold, italic } from "telegraf/format";
import type { GroupSelectionType, MyGroupsSummary, MyGroupSummary } from "../models/mygroup.model";

function formatMyGroupsSummary(summary: MyGroupsSummary, name: string) {
  const { activeGroupsIn, notStartedGroupsIn, inWaitingRoomGroups } = summary;

  const notStartedMsg = notStartedGroupsIn.length
    ? "are not in any Ajo groups that is yet to start."
    : `have also been confirmed as a member of ${summary.notStartedGroupsIn.length} Ajo groups.`;

  const notStartedItalic = notStartedGroupsIn.length
    ? "You can create one with /create_group or join any, with an invite code 🫠"
    : "You can fast track the start of this group by inviting more members of your circle 😉";

  return fmt`${bold("Your Groups Summary:")}
  
Hi ${name}, you are in ${activeGroupsIn.length} groups. 
${
  activeGroupsIn.length &&
  italic("Endeavour to check in with these groups to see if you need to make a contribution 🙂")
}  

You ${notStartedMsg} 
${italic(notStartedItalic)}

Finally, you are in ${inWaitingRoomGroups.length} Waiting Room${inWaitingRoomGroups.length === 1 ? "" : "s"} 

What do you wish to view? 👇
`;
}

const myGroupSummarySelectViewKeyboard = [
  [
    { text: "🔥 Active", callback_data: `group_summary:active` },
    { text: "🕒 Not Started", callback_data: `group_summary:notStarted` },
  ],
  [{ text: "⏳ Waiting Room", callback_data: `group_summary:waitingRoom` }],
];

function formatGroupSummary(summaries: MyGroupSummary[], type: GroupSelectionType) {
  const groups = summaries.map((s, i) => `${i + 1}. ${s.name}`).join("\n");
  return fmt`${bold(
    `Groups you are ${type === "waitingRoom" ? "in the waiting room for" : "active in"}${
      type === "notStarted" && " (but has not started contributions yet)"
    }`
  )}
  
You are in the following ${summaries.length === 1 ? "" : summaries.length} group${summaries.length > 1 ? "s" : ""}
${groups}

${italic("Please select any of the groups from the buttons below to view more actions and info about that group")}
`;
}

function myGroupSelectKeyboard(groups: MyGroupSummary[]) {
  return groups.slice(0, 2).map((group) => [{ text: group.name, callback_data: `group:${group.pda}` }]);
}

export { formatMyGroupsSummary, myGroupSummarySelectViewKeyboard, myGroupSelectKeyboard, formatGroupSummary };
