export const startMessages = {
  getWelcomeMessage: (userName: string): string => {
    return `Hello ${userName}! 👋\n\nWelcome to KooPaa! I'm your friendly assistant for managing contribution and savings groups.\n\nWith KooPaa, you can:\n• Create and join savings groups\n• Link your wallet for secure transactions\n• Track group contributions and balances\n• Set up automated payment schedules`;
  },
  
  getNextSteps: (): string => {
    return `To get started:\n1. Link your wallet using /profile\n2. Create a new group with /create_group or join an existing one with /join_group\n3. Start saving with your community! 💰`;
  }
};