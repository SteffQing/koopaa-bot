import type { MyGroupSummary } from "../models/my_groups.model";

const myGroupSummarySelectViewKeyboard = [
  [
    { text: "🔥 Active", callback_data: `group_summary:active` },
    { text: "🕒 Not Started", callback_data: `group_summary:notStarted` },
  ],
  [{ text: "⏳ Waiting Room", callback_data: `group_summary:waitingRoom` }],
];

function myGroupSelectKeyboard(groups: MyGroupSummary[]) {
  return groups.slice(0, 2).map((group) => [{ text: group.name, callback_data: `group:${group.pda}` }]);
}

function requestJoinGroupKeyboard(pda: string) {
  return [
    [
      { text: "✅ Confirm", callback_data: `join_ajo:${pda}` },
      { text: "❌ Cancel", callback_data: "join_ajo:cancel" },
    ],
  ];
}

export { myGroupSummarySelectViewKeyboard, myGroupSelectKeyboard, requestJoinGroupKeyboard };
