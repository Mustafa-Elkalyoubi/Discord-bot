import { Events } from "discord.js";
import ExtendedClient from "../../utils/Client.js";
import createEventHandler from "../../utils/createEventHandler.js";

const ReactionRemoveHandler = createEventHandler(
  Events.MessageReactionRemove,
  async (messageReaction, user) => {
    if (messageReaction.emoji.name !== "📌" || !messageReaction.message.guildId) return;

    const client = messageReaction.client as ExtendedClient;

    const pinChannel = await client.findTextChannel("pins", messageReaction.message.guildId);
    if (!pinChannel) return;

    pinChannel.send(`yeah you better remove that shit ${user.username}`);
  }
);

export default ReactionRemoveHandler;
