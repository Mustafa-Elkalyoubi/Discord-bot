import {
  Events,
  MessageContextMenuCommandInteraction,
  ChatInputCommandInteraction,
} from "discord.js";
import ExtendedClient from "../utils/Client.js";

export default {
  name: Events.InteractionCreate,
  async run(
    interaction: MessageContextMenuCommandInteraction | ChatInputCommandInteraction,
    client: ExtendedClient
  ) {
    if (
      !interaction.isChatInputCommand() &&
      !interaction.isAutocomplete() &&
      !interaction.isMessageContextMenuCommand()
    )
      return;

    const { commandName } = interaction;

    if (interaction.isMessageContextMenuCommand()) {
      return client.commandManager.runContextCommand(interaction, commandName, client);
    }

    const subCommandName = interaction.options.getSubcommand(false);
    const subCommandGroup = interaction.options.getSubcommandGroup(false);

    if (!subCommandName) return client.commandManager.runCommand(interaction, commandName, client);
    if (!subCommandGroup)
      return client.commandManager.runSubCommand(interaction, commandName, subCommandName, client);
    return client.commandManager.runSubCommandGroup(
      interaction,
      commandName,
      subCommandGroup,
      subCommandName,
      client
    );
  },
};
