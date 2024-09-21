import InteractionCreateHandler from "./interactionCreate";
import MessageCreateHandler from "./messageCreate";
import ReactionAddHandler from "./messageReactions/messageReactionAdd";
import ReactionRemoveHandler from "./messageReactions/messageReactionRemove";
import ReadyHandler from "./ready";

const EventHandlers = [
  InteractionCreateHandler,
  MessageCreateHandler,
  ReactionAddHandler,
  ReactionRemoveHandler,
  ReadyHandler,
] as DiscordEventHandler<keyof ClientEvents>[];

export default EventHandlers;
