import { fmt, bold, italic } from "telegraf/format";

const privySigningError = fmt`
${bold("⚠️ Privy Signing Error")}

${italic("Your session data has expired and needs to be revalidated.")}
Please use the /revalidate command to request a new OTP and set up a fresh session.

Once that's done, you can return here and tap the ${bold("✅ Confirm")} button again to complete your action.
  `;

export { privySigningError };
