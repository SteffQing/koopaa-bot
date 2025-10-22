type GridAjoInit = {
  signature: string;
  pda: string;
  messageId: string;
};

type GridAjoSetup = Omit<GridAjoInit, "pda"> & {
  name: string;
};

type Tag = "real_estate" | "birthday" | "finance" | "lifestyle" | "education" | "travel";

type AjoGroupParticipantData = {
  participant: string;
  contributionRound: number;
  refundAmount: number;
};

type AjoGroupData = {
  name: string;
  created_at: Date;
  description: string;
  tag: Tag;
  cover_photo: number;
  pda: string;
  contributionAmount: number;
  contributionInterval: number;
  payoutInterval: number;
  numParticipants: number;
  participants: AjoGroupParticipantData[];
  startTimestamp: null | number;
  payoutRound: number;
  closeVotes: string[];
  waitingRoom: string[];
  isClosed: boolean;
  admin: string;
};

type AjoGroupDataWithYou = {
  address: string;
  group: AjoGroupData;
};

export type { GridAjoSetup, AjoGroupData, AjoGroupParticipantData, Tag, GridAjoInit, AjoGroupDataWithYou };
