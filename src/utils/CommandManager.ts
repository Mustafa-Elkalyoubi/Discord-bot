import {
  ChatInputCommandInteraction,
  Collection,
  Message,
  MessageContextMenuCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import fs from "node:fs";
import config from "../config.json";

import type {
  Command,
  BaseSubCommand,
  ContextCommand,
  messageCommandProps,
  SubCommand,
} from "../types";
import path from "path";
import { DEFAULT, GREEN } from "./ConsoleText";
import { DateTime } from "luxon";
import ExtendedClient from "./Client";

export default class CommandManager {
  private client: ExtendedClient;
  private commands: Collection<string, Command>;
  private subCommands: Collection<string, BaseSubCommand>;
  private contextCommands: Collection<string, ContextCommand>;
  private messageCommands: Collection<string, messageCommandProps>;
  private aliases: Collection<string, string>;

  private ownerID: string;

  constructor(client: ExtendedClient, ownerID: string) {
    this.commands = new Collection();
    this.subCommands = new Collection();
    this.contextCommands = new Collection();
    this.messageCommands = new Collection();
    this.aliases = new Collection();
    this.ownerID = ownerID;
    this.client = client;

    const messagesPath = path.join(__dirname, "..", "message_commands");
    const messagesFiles = fs.readdirSync(messagesPath);
    messagesFiles.forEach(async (file, index) => {
      const props = await import(path.join(messagesPath, file));
      console.log(
        `${GREEN}[${DateTime.now().toFormat("yyyy-MM-DD HH:mm:ss")}]: ${DEFAULT}Loading command #${
          index + 1
        }: ${props.help.name}`
      );
      this.messageCommands.set(props.help.name, props);
      props.conf.aliases.forEach((alias: string) => {
        this.aliases.set(alias, props.help.name);
      });
    });
  }

  public addCommand(name: string, cmd: Command) {
    this.commands.set(name, cmd);
  }

  public addSubcommand(name: string, cmd: BaseSubCommand) {
    this.subCommands.set(name, cmd);
  }

  public addGroupcommand(groupName: string, commandName: string, cmd: SubCommand) {
    const subCommandInstance = this.subCommands.get(groupName);
    subCommandInstance?.groupCommands.set(commandName, cmd);
  }

  public addContextcommand(name: string, cmd: ContextCommand) {
    this.contextCommands.set(name, cmd);
  }

  public getCommandJSON() {
    const allServersCommandJSONs = this.commands
      .filter((cmd) => cmd.all)
      .map((cmd) => cmd.getSlashCommandJSON());
    const allServersSubCommandJSONs = this.subCommands
      .filter((cmd) => cmd.all)
      .map((cmd) => cmd.getSlashCommandJSON());
    const allServersContextJSONs = this.contextCommands
      .filter((cmd) => cmd.all)
      .map((cmd) => cmd.getContextCommandJSON());

    const privateCommandJSONs = this.commands
      .filter((cmd) => !cmd.all)
      .map((cmd) => cmd.getSlashCommandJSON());
    const privateSubCommandJSONs = this.subCommands
      .filter((cmd) => !cmd.all)
      .map((cmd) => cmd.getSlashCommandJSON());
    const privateContextJSONs = this.contextCommands
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

  public async reload(command: string) {
    const messagesPath = path.join(__dirname, "..", "message_commands");

    const cmdPath = path.join(messagesPath, command);
    const cmd = await import(cmdPath);
    return new Promise((resolve) => {
      delete require.cache[require.resolve(cmdPath)];
      this.aliases.forEach((cmd, alias) => {
        if (cmd === command) this.aliases.delete(alias);
      });
      this.messageCommands.set(command, cmd);
      cmd.conf.aliases.forEach((alias: string) => {
        this.aliases.set(alias, cmd.help.name);
      });
      resolve(null);
    });
  }

  private elevation(message: Message) {
    let permlevel = 0;
    if (message.author.id === this.ownerID) return 4;
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

  public runMessageCommand(message: Message) {
    const command = message.content.split(" ")[0].slice(config.prefix.length).toLowerCase();
    const args = message.content.split(" ").slice(1);
    const perms = this.elevation(message);
    const cmd = this.messageCommands.get(command);

    if (cmd) {
      if (perms < cmd.conf.permLevel)
        return message.reply("You don't have the permissions to use that");
      cmd.run(message, args, this.client);
    }
  }

  public getMessageCommand(name: string) {
    if (this.messageCommands.has(name)) return name;
    else if (this.aliases.has(name)) return this.aliases.get(name)!;

    return null;
  }

  public async runSubCommand(
    interaction: ChatInputCommandInteraction,
    commandName: string,
    subCommandName: string,
    client: ExtendedClient
  ) {
    try {
      const subCommandInstance = this.subCommands.get(commandName);
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

  public async runCommand(
    interaction: ChatInputCommandInteraction,
    commandName: string,
    client: ExtendedClient
  ) {
    try {
      const runner = this.commands.get(commandName);
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

  public async runContextCommand(
    interaction: MessageContextMenuCommandInteraction,
    commandName: string,
    client: ExtendedClient
  ) {
    const command = this.contextCommands.get(commandName);
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

  public async runSubCommandGroup(
    interaction: ChatInputCommandInteraction,
    commandName: string,
    subCommandGroup: string,
    subCommandName: string,
    client: ExtendedClient
  ) {
    try {
      const subCommandInstance = this.subCommands.get(commandName);
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
}
