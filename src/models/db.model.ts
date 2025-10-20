export interface SessionRow {
  value: string;
}

export interface User {
  address: string;
  username: string;
  externalId: string;
  email: string;
}

export interface Balance {
  solBalance: number;
  usdcBalance: number;
}
