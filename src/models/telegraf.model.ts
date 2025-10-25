import { Context as TelegrafContext } from "telegraf";

type AuthState = "auth:email" | "auth:otp" | "auth:revalidate";

interface Session {
  state: "idle" | AuthState | "create_ajo" | "join_ajo" | "add_participant";
  token: string | null;
  toDelete: number[];
  msgId: number | undefined;
}

type Context = TelegrafContext & {
  session: Session;
  match?: RegExpExecArray;
  _cbAnswered?: boolean;
};
export type { Session, Context };
