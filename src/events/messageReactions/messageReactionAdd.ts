import { Events, MessageReaction, User } from "discord.js";
import ExtendedClient from "../../utils/Client";

export = {
  name: Events.MessageReactionAdd,
  async run(messageReaction: MessageReaction, user: User) {
    if (messageReaction.emoji.name !== "📌" || !messageReaction.message.guildId) return;

    const client = messageReaction.client as ExtendedClient;

    const pinChannel = await client.findTextChannel("pins", messageReaction.message.guildId);
    if (!pinChannel) return;

    pinChannel.send(`Eat my ass ${user.username}`);
  },
};
