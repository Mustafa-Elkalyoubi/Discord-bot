import {
  Events,
  MessageContextMenuCommandInteraction,
  ChatInputCommandInteraction,
  Collection,
} from "discord.js";
import ExtendedClient from "../utils/Client";

export = {
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

    if (interaction.isMessageContextMenuCommand()) {
      const { commandName } = interaction;
      return runContextCommand(interaction, commandName, client);
    }

    const { commandName } = interaction;
    const subCommandName = interaction.options.getSubcommand(false);
    const subCommandGroup = interaction.options.getSubcommandGroup(false);

    if (!subCommandName) return runCommand(interaction, commandName, client);
    if (!subCommandGroup) return runSubCommand(interaction, commandName, subCommandName, client);
    return runSubCommandGroup(interaction, commandName, subCommandGroup, subCommandName, client);
  },
};

async function runSubCommandGroup(
  interaction: ChatInputCommandInteraction,
  commandName: string,
  subCommandGroup: string,
  subCommandName: string,
  client: ExtendedClient
) {
  try {
    const subCommandInstance = client.subCommands.get(commandName);
    const subCommandGroupInstance = subCommandInstance?.groupCommands.get(subCommandGroup);
    if (subCommandGroupInstance == undefined) throw "Error: SubCommand group not found";
    if (!(subCommandGroupInstance instanceof Collection)) return;
    const runner = subCommandGroupInstance.get(subCommandName);
    if (runner == undefined) throw "Error: SubCommand in group not found";
    if (interaction.isAutocomplete()) {
      if (!runner.autocomplete) throw "Missing autocomplete function";
      return runner.autocomplete(interaction, client);
    }
    return runner.run(interaction, client);
  } catch (err) {
    console.error(err);
  }
}

async function runSubCommand(
  interaction: ChatInputCommandInteraction,
  commandName: string,
  subCommandName: string,
  client: ExtendedClient
) {
  try {
    const subCommandInstance = client.subCommands.get(commandName);
    if (subCommandInstance == undefined) throw "Could not find main subcommand file somehow";
    const runner = subCommandInstance.groupCommands.get(subCommandName);
    if (runner == undefined) throw "huh";
    if (runner instanceof Collection) throw "huh2";
    if (interaction.isAutocomplete()) {
      if (!runner.autocomplete) throw "No autocomplete function found";
      return runner.autocomplete(interaction, client);
    }
    runner.run(interaction, client);
  } catch (err) {
    console.error(err);
  }
}

async function runCommand(
  interaction: ChatInputCommandInteraction,
  commandName: string,
  client: ExtendedClient
) {
  try {
    const runner = client.commands.get(commandName);
    if (runner == undefined) throw "Could not find command";
    if (interaction.isAutocomplete()) {
      if (!runner.autocomplete) throw "No autocomplete function found";
      return runner.autocomplete(interaction, client);
    }
    runner.run(interaction, client);
  } catch (err) {
    console.error(err);
    interaction.reply({ content: "There was an error running this command", ephemeral: true });
  }
}

async function runContextCommand(
  interaction: MessageContextMenuCommandInteraction,
  commandName: string,
  client: ExtendedClient
) {
  const command = client.contextCommands.get(commandName);
  if (!command) throw `No command matching ${commandName} was found`;

  try {
    command.run(interaction, client);
  } catch (err) {
    console.error(err);
    return interaction.reply({
      content: "There was an error while executing this command",
      ephemeral: true,
    });
  }
}
