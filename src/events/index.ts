import ready from "./ready.js";
import interactionCreate from "./interactionCreate.js";
import messageCreate from "./messageCreate.js";
import messageReactionAdd from "./messageReactions/messageReactionAdd.js";
import messageReactionRemove from "./messageReactions/messageReactionRemove.js";

export default [ready, interactionCreate, messageCreate, messageReactionAdd, messageReactionRemove];
