export const joinGroupMessages = {
  getJoinGroupMessage: (userName: string): string => {
    return `🙋‍♂️ *${userName}, ready to join a group?*\n\n` +
           `To join an existing contribution or savings group, you'll need either:\n` +
           `• A group ID, or\n` +
           `• An invite link from the group creator\n\n` +
           `Currently, group joining is handled through the web application.`;
  },
  
  getJoinInstructions: (): string => {
    return `To join a group:\n` +
           `1. Open the KooPaa web app\n` +
           `2. Click on "Join Group"\n` +
           `3. Enter the group ID or click the invite link\n` +
           `4. Confirm your participation\n\n` +
           `Need the group ID? Ask the group creator for it!`;
  },
  
  getJoinSuccessMessage: (groupName: string): string => {
    return `🎊 *Success!* You've joined "${groupName}"\n\n` +
           `You're now part of this savings group. Check your group details and contribution schedule.`;
  },
  
  getInvalidGroupMessage: (): string => {
    return `❌ Invalid group ID or link. Please check with the group creator for the correct details.`;
  }
};