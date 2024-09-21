import { Events } from "discord.js";
import ExtendedClient from "../../utils/Client.js";
import createEventHandler from "../../utils/createEventHandler.js";

const ReactionAddHandler = createEventHandler(
  Events.MessageReactionAdd,
  async (messageReaction, user) => {
    if (messageReaction.emoji.name !== "📌" || !messageReaction.message.guildId) return;

    const client = messageReaction.client as ExtendedClient;

    const pinChannel = await client.findTextChannel("pins", messageReaction.message.guildId);
    if (!pinChannel) return;

    pinChannel.send(`Eat my ass ${user.username}`);
  }
);

export default ReactionAddHandler;
