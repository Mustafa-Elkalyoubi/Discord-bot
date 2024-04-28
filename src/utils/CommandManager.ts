import {
  ChatInputCommandInteraction,
  Collection,
  Message,
  MessageContextMenuCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import fs from "node:fs";
import config from "../config.json";

import { DateTime } from "luxon";
import path from "path";
import type {
  BaseSubCommand,
  Command,
  ContextCommand,
  SubCommand,
  messageCommandProps,
} from "../types";
import ExtendedClient from "./Client";
import Modifiers from "./ConsoleText";
import { dynamicImport } from "./general";

export default class CommandManager {
  #client: ExtendedClient;
  #commands: Collection<string, Command>;
  #subCommands: Collection<string, BaseSubCommand>;
  #contextCommands: Collection<string, ContextCommand>;
  #messageCommands: Collection<string, messageCommandProps>;
  #aliases: Collection<string, string>;
  #ownerID: string;

  constructor(client: ExtendedClient, ownerID: string) {
    this.#commands = new Collection();
    this.#subCommands = new Collection();
    this.#contextCommands = new Collection();
    this.#messageCommands = new Collection();
    this.#aliases = new Collection();
    this.#ownerID = ownerID;
    this.#client = client;

    const messagesPath = path.join(__dirname, "..", "message_commands");
    const messagesFiles = fs.readdirSync(messagesPath);
    messagesFiles.forEach(async (file, index) => {
      const props = await dynamicImport(path.join(messagesPath, file));
      console.log(
        `${Modifiers.GREEN}[${DateTime.now().toFormat("yyyy-MM-DD HH:mm:ss")}]: ${
          Modifiers.DEFAULT
        }Loading command #${index + 1}: ${props.help.name}`
      );
      this.#messageCommands.set(props.help.name, props);
      props.conf.aliases.forEach((alias: string) => {
        this.#aliases.set(alias, props.help.name);
      });
    });
  }

  addCommand(name: string, cmd: Command) {
    this.#commands.set(name, cmd);
  }

  addSubcommand(name: string, cmd: BaseSubCommand) {
    this.#subCommands.set(name, cmd);
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

  async reload(command: string) {
    const messagesPath = path.join(__dirname, "..", "message_commands");

    const cmdPath = path.join(messagesPath, command);
    const cmd = await dynamicImport(cmdPath);
    return new Promise((resolve) => {
      delete require.cache[require.resolve(cmdPath)];
      this.#aliases.forEach((cmd, alias) => {
        if (cmd === command) this.#aliases.delete(alias);
      });
      this.#messageCommands.set(command, cmd);
      cmd.conf.aliases.forEach((alias: string) => {
        this.#aliases.set(alias, cmd.help.name);
      });
      resolve(null);
    });
  }

  #elevation(message: Message) {
    let permlevel = 0;
    if (message.author.id === this.#ownerID) return 4;
    if (message.guild === null) return 0;

    const flags = PermissionsBitField.Flags;
    const hasPerm = (flag: bigint) => message.member?.permissions.has(flag);

    if (
      hasPerm(flags.ManageRoles) &&
      hasPerm(flags.ManageChannels) &&
      hasPerm(flags.ManageMessages)
    )
      permlevel = 2;
    if (hasPerm(flags.Administrator)) permlevel = 3;

    return permlevel;
  }

  runMessageCommand(message: Message) {
    const command = message.content.split(" ")[0].slice(config.prefix.length).toLowerCase();
    const args = message.content.split(" ").slice(1);
    const perms = this.#elevation(message);

    const cmdName = this.getMessageCommand(command);
    if (!cmdName) {
      return console.error(`Could'nt find ${cmdName} command`);
    }
    const cmd = this.#messageCommands.get(cmdName);

    if (cmd) {
      if (perms < cmd.conf.permLevel)
        return message.reply("You don't have the permissions to use that");
      cmd.run(message, args, this.#client);
    }
  }

  getMessageCommand(name: string) {
    if (this.#messageCommands.has(name)) return name;
    else if (this.#aliases.has(name)) return this.#aliases.get(name)!;

    return null;
  }

  async runSubCommand(
    interaction: ChatInputCommandInteraction,
    commandName: string,
    subCommandName: string,
    client: ExtendedClient
  ) {
    try {
      const subCommandInstance = this.#subCommands.get(commandName);
      if (subCommandInstance == undefined) throw "Could not find main subcommand file somehow";
      const runner = subCommandInstance.groupCommands.get(subCommandName);
      if (runner == undefined) throw "Runner not found";
      if (runner instanceof Collection) throw "Runner not a collection";
      if (interaction.isAutocomplete()) {
        if (!runner.autocomplete) throw "No autocomplete function found";
        return runner.autocomplete(interaction, client);
      }
      runner.run(interaction, client);
    } catch (err) {
      console.error(err);
    }
  }

  async runCommand(
    interaction: ChatInputCommandInteraction,
    commandName: string,
    client: ExtendedClient
  ) {
    try {
      const runner = this.#commands.get(commandName);
      if (runner == undefined) throw "Could not find command";
      if (interaction.isAutocomplete()) {
        if (!runner.autocomplete) throw "No autocomplete function found";
        return runner.autocomplete(interaction, client);
      }
      client.commandsUsed.inc();
      client.activeCommands.inc();
      await runner.run(interaction, client);
      client.activeCommands.dec();
    } catch (err) {
      console.error(err);
      client.activeCommands.dec();
      client.erroredCommands.inc();
      if (interaction && !interaction.replied && !interaction.deferred)
        interaction.reply({ content: "There was an error running this command", ephemeral: true });
    }
  }

  async runContextCommand(
    interaction: MessageContextMenuCommandInteraction,
    commandName: string,
    client: ExtendedClient
  ) {
    const command = this.#contextCommands.get(commandName);
    if (!command) throw `No command matching ${commandName} was found`;

    try {
      client.commandsUsed.inc();
      client.activeCommands.inc();
      await command.run(interaction, client);
      client.activeCommands.dec();
    } catch (err) {
      console.error(err);
      client.activeCommands.dec();
      client.erroredCommands.inc();
      return interaction.reply({
        content: "There was an error while executing this command",
        ephemeral: true,
      });
    }
  }

  async runSubCommandGroup(
    interaction: ChatInputCommandInteraction,
    commandName: string,
    subCommandGroup: string,
    subCommandName: string,
    client: ExtendedClient
  ) {
    try {
      const subCommandInstance = this.#subCommands.get(commandName);
      const subCommandGroupInstance = subCommandInstance?.groupCommands.get(subCommandGroup);
      if (subCommandGroupInstance == undefined) throw "Error: SubCommand group not found";
      if (!(subCommandGroupInstance instanceof Collection)) return;
      const runner = subCommandGroupInstance.get(subCommandName);
      if (runner == undefined) throw "Error: SubCommand in group not found";
      if (interaction.isAutocomplete()) {
        if (!runner.autocomplete) throw "Missing autocomplete function";
        return runner.autocomplete(interaction, client);
      }

      client.commandsUsed.inc();
      client.activeCommands.inc();
      await runner.run(interaction, client);
      client.activeCommands.dec();
    } catch (err) {
      console.error(err);
      client.activeCommands.dec();
      client.erroredCommands.inc();
    }
  }
}
