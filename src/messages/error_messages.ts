import { fmt, bold, italic } from "telegraf/format";

const privySigningError = fmt`
${bold("⚠️ Privy Signing Error")}

${italic("Your session data has expired and needs to be revalidated.")}
Please use the /revalidate command to request a new OTP and set up a fresh session.

Once that's done, you can return here and tap the ${bold("✅ Confirm")} button again to complete your action.
  `;

const unauthorizedError = fmt`
${bold("⚠️ Unauthorized")}

${italic("You need to reauthenticate in as your previous session has ended.")}
Please use the /authenticate command to set up a new session.
  `;

const expiredGridAuthenticationError = fmt`
${bold("⚠️ Authentication session expired")}

${italic("Your session data has expired and needs to be revalidated.")}
Please use the /revalidate command to request a new OTP and set up a fresh session.

Once that's done, you can return here to complete your action.
  `;

export { privySigningError, unauthorizedError, expiredGridAuthenticationError };
