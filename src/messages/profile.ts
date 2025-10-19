interface UserProfile {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  walletAddress: string;
}

export const profileMessages = {
  getProfileMessage: (profile: UserProfile): string => {
    return (
      `👤 *Your Profile*\n\n` +
      `ID: \`${profile.userId}\`\n` +
      `Name: ${profile.firstName} ${profile.lastName || ""}\n` +
      `Username: @${profile.username}\n` +
      `Wallet: ${profile.walletAddress}\n\n` +
      `To link a new wallet, please contact support or use the web interface.`
    );
  },

  getNoWalletMessage: (): string => {
    return (
      `👤 *Your Profile*\n\n` +
      `ID: \`${(globalThis as any).currentUserId || "N/A"}\n` +
      `Name: ${(globalThis as any).currentUserName || "Unknown"}\n` +
      `Username: @${(globalThis as any).currentUserUsername || "N/A"}\n` +
      `Wallet: Not linked\n\n` +
      `To link your wallet, please use the web interface or contact support.`
    );
  },
};
