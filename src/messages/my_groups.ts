import { fmt, bold, italic } from "telegraf/format";
import type { GroupSelectionType, MyGroupsSummary, MyGroupSummary } from "../models/my_groups.model";

function formatMyGroupsSummary(summary: MyGroupsSummary, name: string) {
  const { activeGroupsIn, notStartedGroupsIn, inWaitingRoomGroups } = summary;

  const notStartedMsg = notStartedGroupsIn.length
    ? `are a member of ${summary.notStartedGroupsIn.length} Ajo groups that are yet to start.`
    : "are not in any Ajo groups that is yet to start.";

  const notStartedItalic = notStartedGroupsIn.length
    ? "You can fast track the start of this group by inviting more members of your circle 😉"
    : "You can create one with /create_group or join any, with an invite code 🫠";

  return fmt`${bold("Your Groups Summary")}
  
Hi ${name}, you are in ${activeGroupsIn.length} active groups. 
${
  activeGroupsIn.length
    ? italic("Endeavour to check in with these groups to see if you need to make a contribution 🙂")
    : ""
}  

You ${notStartedMsg} 
${italic(notStartedItalic)}

Finally, you are in ${inWaitingRoomGroups.length} Waiting Room${inWaitingRoomGroups.length === 1 ? "" : "s"} 

What do you wish to view? 👇
`;
}

function formatGroupSummary(summaries: MyGroupSummary[], type: GroupSelectionType) {
  const groups = summaries.map((s, i) => `${i + 1}. ${s.name}`).join("\n");
  return fmt`${bold(
    `Groups you are ${type === "waitingRoom" ? "in the waiting room for" : "active in"}${
      type === "notStarted" ? " (but has not started contributions yet)" : ""
    }`
  )}
  
You are in the following${summaries.length === 1 ? "" : summaries.length} group${summaries.length > 1 ? "s" : ""}
${groups}

${italic("Please select any of the groups from the buttons below to view more actions and info about that group")}
`;
}

export { formatMyGroupsSummary, formatGroupSummary };
