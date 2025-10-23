import { fmt, bold, italic, code, link } from "telegraf/format";
import { Balance, User } from "../models/db.model";
import { truncate } from "../utils";

function formatUserData(user: User) {
  return fmt`${bold`👤 Your Profile`}

${bold`Email Address: `} ${user.email}
${bold`Wallet Address: `} ${code(truncate(user.address))}
   
${bold`Balances: `}${italic`_Loading..._`}
`;
}

function formatUserDataWithBalance(user: User, balance: Balance) {
  return fmt`${bold`👤 Your Profile`}

${bold`Email Address: `} ${user.email}
${bold`Wallet Address: `} ${code(truncate(user.address))}
   
${bold`Balances: `}
• SOL: ${balance.solBalance.toFixed(4)}
• USDC: ${balance.usdcBalance.toFixed(2)}

${link("View more on Solscan", `https://solscan.io/account/${user.address}`)}
`;
}

export { formatUserData, formatUserDataWithBalance };
