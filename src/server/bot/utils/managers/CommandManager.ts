import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Collection,
  MessageContextMenuCommandInteraction,
} from "discord.js";

import ExtendedClient from "../Client.js";
import MessageCommandManager from "./MessageCommandManager.js";
import DataCollector from "@/server/DataCollector/DataCollector.js";

class CommandManager {
  #client: ExtendedClient;
  #collector: DataCollector;

  #commands: Collection<string, Command>;
  #subCommands: Collection<string, BaseSubCommand>;
  #contextCommands: Collection<string, ContextCommand>;

  messageCommandManager: MessageCommandManager;

  constructor(client: ExtendedClient, ownerID: string, collector: DataCollector) {
    this.#commands = new Collection();
    this.#subCommands = new Collection();
    this.#contextCommands = new Collection();
    this.#client = client;
    this.#collector = collector;

    this.messageCommandManager = new MessageCommandManager(client, ownerID, collector);
  }

  addCommand(name: string, cmd: Command) {
    this.#commands.set(name, cmd);
    this.#collector.loadCommand(cmd);
  }

  addSubcommand(name: string, cmd: BaseSubCommand) {
    this.#subCommands.set(name, cmd);
    this.#collector.loadSubcommand(cmd);
  }

  addGroupcommand(groupName: string, commandName: string, cmd: SubCommand) {
    const subCommandInstance = this.#subCommands.get(groupName);
    subCommandInstance?.groupCommands.set(commandName, cmd);
  }

  addContextcommand(name: string, cmd: ContextCommand) {
    this.#contextCommands.set(name, cmd);
  }

  getCommandJSON() {
    const allServersCommandJSONs = this.#commands
      .filter((cmd) => cmd.all)
      .map((cmd) => cmd.getSlashCommandJSON());
    const allServersSubCommandJSONs = this.#subCommands
      .filter((cmd) => cmd.all)
      .map((cmd) => cmd.getSlashCommandJSON());
    const allServersContextJSONs = this.#contextCommands
      .filter((cmd) => cmd.all)
      .map((cmd) => cmd.getContextCommandJSON());

    const privateCommandJSONs = this.#commands
      .filter((cmd) => !cmd.all)
      .map((cmd) => cmd.getSlashCommandJSON());
    const privateSubCommandJSONs = this.#subCommands
      .filter((cmd) => !cmd.all)
      .map((cmd) => cmd.getSlashCommandJSON());
    const privateContextJSONs = this.#contextCommands
      .filter((cmd) => !cmd.all)
      .map((cmd) => cmd.getContextCommandJSON());

    return {
      publicCommands: [
        ...allServersCommandJSONs,
        ...allServersSubCommandJSONs,
        ...allServersContextJSONs,
      ],
      privateCommands: [...privateCommandJSONs, ...privateSubCommandJSONs, ...privateContextJSONs],
    };
  }

  #handleAutocomplete(
    runner: { autocomplete?: typeof AutocompleteHandler },
    interaction: AutocompleteInteraction
  ) {
    if (!runner.autocomplete) throw new Error("No autocomplete function found");
    return runner.autocomplete(interaction, this.#client);
  }

  #handleError(error: unknown, interaction: ChatInputCommandInteraction) {
    console.error(error);

    const errorMessage = "There was an error running this command";

    if (interaction.replied || interaction.deferred)
      interaction.editReply({ content: errorMessage });
    else interaction.reply({ content: errorMessage, ephemeral: true });
  }

  async runCommand(
    interaction: ChatInputCommandInteraction | AutocompleteInteraction,
    commandName: string
  ) {
    const runner = this.#commands.get(commandName);
    if (runner == undefined) throw new Error("Could not find command");

    if (interaction.isAutocomplete()) {
      return this.#handleAutocomplete(runner, interaction);
    }

    // client.commandsUsed.inc(1);
    // client.activeCommands.inc(1);
    try {
      await runner.run(interaction, this.#client);
      // client.activeCommands.dec(1);
    } catch (err) {
      this.#handleError(err, interaction);
    }
  }

  async runSubCommand(
    interaction: ChatInputCommandInteraction | AutocompleteInteraction,
    commandName: string,
    subCommandName: string
  ) {
    const subCommandInstance = this.#subCommands.get(commandName);
    if (subCommandInstance == undefined)
      throw new Error("Could not find main subcommand file somehow");
    const runner = subCommandInstance.groupCommands.get(subCommandName);
    if (runner == undefined) throw new Error("Runner not found");
    if (runner instanceof Collection) throw new Error("Runner not a collection");

    if (interaction.isAutocomplete()) {
      return this.#handleAutocomplete(runner, interaction);
    }

    try {
      runner.run(interaction, this.#client);
    } catch (err) {
      this.#handleError(err, interaction);
    }
  }

  async runSubCommandGroup(
    interaction: ChatInputCommandInteraction | AutocompleteInteraction,
    commandName: string,
    subCommandGroup: string,
    subCommandName: string
  ) {
    const subCommandInstance = this.#subCommands.get(commandName);
    const subCommandGroupInstance = subCommandInstance?.groupCommands.get(subCommandGroup);
    if (subCommandGroupInstance == undefined) throw new Error("Error: SubCommand group not found");
    if (!(subCommandGroupInstance instanceof Collection)) return;
    const runner = subCommandGroupInstance.get(subCommandName);
    if (runner == undefined) throw new Error("Error: SubCommand in group not found");

    if (interaction.isAutocomplete()) {
      return this.#handleAutocomplete(runner, interaction);
    }

    try {
      // client.commandsUsed.inc(1);
      // client.activeCommands.inc(1);
      await runner.run(interaction, this.#client);
      // client.activeCommands.dec(1);
    } catch (err) {
      this.#handleError(err, interaction);
      // client.activeCommands.dec(1);
      // client.erroredCommands.inc(1);
    }
  }

  async runContextCommand(interaction: MessageContextMenuCommandInteraction, commandName: string) {
    const command = this.#contextCommands.get(commandName);
    if (!command) throw new Error(`No command matching ${commandName} was found`);

    try {
      // client.commandsUsed.inc(1);
      // client.activeCommands.inc(1);
      await command.run(interaction, this.#client);
      // client.activeCommands.dec(1);
    } catch (err) {
      console.error(err);
      // client.activeCommands.dec(1);
      // client.erroredCommands.inc(1);
      return interaction.reply({
        content: "There was an error while executing this command",
        ephemeral: true,
      });
    }
  }
}

export default CommandManager;
