import { OAuth2Scopes } from "discord.js";

const InviteCommand: MessageCommand = {
  conf: {
    aliases: ["inv"],
    permLevel: 4,
  },
  help: {
    name: "invite",
    description: "Invite the bot",
    usage: "invite",
  },
  run: async (message, _, client) => {
    return message.reply(
      client.generateInvite({
        scopes: [OAuth2Scopes.ApplicationsCommands],
        permissions: ["Administrator"],
      })
    );
  },
};

export default InviteCommand;
