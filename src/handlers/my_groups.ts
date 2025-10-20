interface Group {
  id: string;
  name: string;
  members: number;
  totalAmount: number; // Amount in the group's currency
}

export const myGroupsMessages = {
  getMyGroupsMessage: (groups: Group[]): string => {
    if (groups.length === 0) {
      return `📋 *Your Groups*\n\n` +
             `You're not currently part of any groups.\n\n` +
             `Use /create_group to start your own or /join_group to join an existing one!`;
    }
    
    let message = `📋 *Your Groups* (${groups.length})\n\n`;
    
    groups.forEach((group, index) => {
      message += `*${index + 1}. ${group.name}*\n` +
                 `ID: \`${group.id}\`\n` +
                 `Members: ${group.members}\n` +
                 `Total: $${group.totalAmount}\n\n`;
    });
    
    message += `To manage your groups, visit the web application.`;
    
    return message;
  },
  
  getNoGroupsMessage: (): string => {
    return `📋 *Your Groups*\n\n` +
           `You're not currently part of any groups.\n\n` +
           `Use /create_group to start your own or /join_group to join an existing one!`;
  }
};