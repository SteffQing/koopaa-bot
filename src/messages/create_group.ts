export const createGroupMessages = {
  getCreateGroupMessage: (userName: string): string => {
    return `🏗️ *${userName}, let's create a new group!*\n\n` +
           `You're about to create a new contribution or savings group.\n\n` +
           `In the web application, you can:\n` +
           `• Set group name and description\n` +
           `• Define contribution amounts and schedule\n` +
           `• Invite members via link or ID\n` +
           `• Configure group rules and settings\n\n` +
           `Would you like to proceed with group creation?`;
  },
  
  getGroupCreationInstructions: (): string => {
    return `To create your group:\n` +
           `1. Open the KooPaa web app\n` +
           `2. Click on "Create Group"\n` +
           `3. Fill in group details\n` +
           `4. Share the invite link with members\n\n` +
           `Need help? Contact support or check /help`;
  },
  
  getGroupCreatedConfirmation: (groupName: string): string => {
    return `🎉 *Success!* Your group "${groupName}" has been created!\n\n` +
           `Share the group ID or invite link with others to join your savings group.`;
  }
};