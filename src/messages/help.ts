export const helpMessages = {
  getHelpMessage: (): string => {
    return (
      `📋 *KooPaa Bot Commands*\n\n` +
      `*\\/start* - Start KooPaa and link your wallet\n` +
      `*\\/profile* - View your linked wallet and user info\n` +
      `*\\/help* - Show all available commands and how to use them\n` +
      `*\\/create_group* - Create a new contribution or savings group\n` +
      `*\\/join_group* - Join an existing group by ID or invite link\n` +
      `*\\/my_groups* - See the list of groups you belong to\n\n` +
      `For more information about any command, use the command directly.`
    );
  },

  getDetailedHelp: (command: string): string => {
    switch (command) {
      case "start":
        return `*\\/start* command\n\nThis command initializes your KooPaa experience and helps you link your wallet.`;
      case "profile":
        return `*\\/profile* command\n\nThis command displays your user information and linked wallet address.`;
      case "create_group":
        return `*\\/create_group* command\n\nThis command allows you to create a new savings or contribution group.`;
      case "join_group":
        return `*\\/join_group* command\n\nThis command allows you to join an existing group using an ID or invite link.`;
      case "my_groups":
        return `*\\/my_groups* command\n\nThis command shows all the groups you're currently a member of.`;
      default:
        return `Help information for command '${command}' not available.`;
    }
  },
};
