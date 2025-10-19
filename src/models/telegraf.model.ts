import { Context as TelegrafContext } from "telegraf";

type AuthState = "auth:email" | "auth:otp";

interface Session {
  state: "idle" | "awaiting_issue" | AuthState;
  token: string | null;
  toDelete: number[];
  msgId: number | undefined;
}

type Context = TelegrafContext & {
  session: Session;
  match?: RegExpExecArray;
};
export type { Session, Context };
