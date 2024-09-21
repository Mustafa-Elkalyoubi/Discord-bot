import { Events } from "discord.js";
import createEventHandler from "../utils/createEventHandler.js";

const InteractionCreateHandler = createEventHandler(
  Events.InteractionCreate,
  async (interaction, client) => {
    if (
      !interaction.isChatInputCommand() &&
      !interaction.isAutocomplete() &&
      !interaction.isMessageContextMenuCommand()
    )
      return;

    const { commandName } = interaction;

    if (interaction.isMessageContextMenuCommand()) {
      return client.commandManager.runContextCommand(interaction, commandName);
    }

    const subCommandName = interaction.options.getSubcommand(false);
    const subCommandGroup = interaction.options.getSubcommandGroup(false);

    if (!subCommandName) return client.commandManager.runCommand(interaction, commandName);
    if (!subCommandGroup)
      return client.commandManager.runSubCommand(interaction, commandName, subCommandName);
    return client.commandManager.runSubCommandGroup(
      interaction,
      commandName,
      subCommandGroup,
      subCommandName
    );
  }
);

export default InteractionCreateHandler;
