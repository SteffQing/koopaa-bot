type MyGroupSummary = {
  name: string;
  pda: string;
};

type MyGroupsSummary = {
  activeGroupsIn: MyGroupSummary[];
  notStartedGroupsIn: MyGroupSummary[];
  inWaitingRoomGroups: MyGroupSummary[];
};

type GroupSelectionType = "active" | "notStarted" | "waitingRoom";

export type { MyGroupSummary, MyGroupsSummary, GroupSelectionType };
