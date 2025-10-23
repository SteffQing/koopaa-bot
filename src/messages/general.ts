import { bold, code, fmt, italic } from "telegraf/format";

function formatInviteCodeGenerated(msg: string, code_: string) {
  return fmt`🎉 ${bold("Invite Code generated successfully!")}

${msg}

${code(code_)}

${italic("This code is only valid for 7 days!")}
  `;
}

export { formatInviteCodeGenerated };
