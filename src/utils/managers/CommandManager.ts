import {
  ChatInputCommandInteraction,
  Collection,
  Message,
  MessageContextMenuCommandInteraction,
  PermissionsBitField,
  Routes,
} from "discord.js";
import { DateTime } from "luxon";
import path from "path";

import type ExtendedClient from "../Client.js";
import type ContextCommand from "../command/ContextCommand.js";
import type SubCommandHandler from "../command/SubCommandHandler.js";
import type TextCommand from "../command/TextCommand.js";

import Modifiers from "../ConsoleText.js";

import Commands from "../../commands/index.js";
import ContextCommands from "../../contextCommands/index.js";
import MessageCommands from "../../message_commands/index.js";
import SubCommands from "../../subCommands/index.js";

export default class CommandManager {
  #client: ExtendedClient;
  #commands: Collection<string, TextCommand>;
  #subCommands: Collection<string, SubCommandHandler>;
  #contextCommands: Collection<string, ContextCommand>;
  #messageCommands: Collection<string, MessageCommand>;
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
  }

  async registerCommands() {
    this.#initializeCommands();
    const { CLIENT_ID, TEST_GUILD } = process.env;

    try {
      const { publicCommands, privateCommands } = this.#getCommandJSON();

      await Promise.all([
        this.#client.rest.put(Routes.applicationCommands(CLIENT_ID!), {
          body: publicCommands,
        }),

        this.#client.rest.put(Routes.applicationGuildCommands(CLIENT_ID!, TEST_GUILD!), {
          body: privateCommands,
        }),
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  #initializeCommands() {
    MessageCommands.forEach(async (command, index) => {
      this.#client.log(
        "Command Manager",
        `${Modifiers.GREEN}[${DateTime.now().toFormat("yyyy-MM-DD HH:mm:ss")}]: ${
          Modifiers.DEFAULT
        }Loading command #${index + 1}: ${command.help.name}`
      );
      this.#messageCommands.set(command.help.name, command);
      command.conf.aliases.forEach((alias: string) => {
        this.#aliases.set(alias, command.help.name);
      });
    });

    Commands.forEach((Command) => {
      const cmd = new Command();
      this.#commands.set(cmd.name, cmd);
      this.#client.log(
        "Command Manager",
        `${Modifiers.GREEN}Registering command: ${Modifiers.DEFAULT}${cmd.name}`
      );
    });

    SubCommands.forEach((BaseSubCommand) => {
      const subCommand = new BaseSubCommand();
      this.#client.log(
        "Command Manager",
        `${Modifiers.GREEN}Registering Subcommand: ${Modifiers.DEFAULT}${subCommand.name}`
      );
      this.#subCommands.set(subCommand.name, subCommand);
    });

    ContextCommands.forEach((ContextCommand) => {
      const cmd = new ContextCommand();

      this.#contextCommands.set(cmd.name, cmd);
      this.#client.log(
        "Command Manager",
        `${Modifiers.GREEN}Registering context command: ${Modifiers.DEFAULT}${cmd.name}`
      );
    });
  }

  #getCommandJSON() {
    const allServersCommandJSONs = this.#commands
      .filter((cmd) => cmd.private)
      .map((cmd) => cmd.getSlashCommandJSON());
    const allServersSubCommandJSONs = this.#subCommands
      .filter((cmd) => cmd.private)
      .map((cmd) => cmd.getSlashCommandJSON());
    const allServersContextJSONs = this.#contextCommands
      .filter((cmd) => cmd.private)
      .map((cmd) => cmd.getSlashCommandJSON());

    const privateCommandJSONs = this.#commands
      .filter((cmd) => !cmd.private)
      .map((cmd) => cmd.getSlashCommandJSON());
    const privateSubCommandJSONs = this.#subCommands
      .filter((cmd) => !cmd.private)
      .map((cmd) => cmd.getSlashCommandJSON());
    const privateContextJSONs = this.#contextCommands
      .filter((cmd) => !cmd.private)
      .map((cmd) => cmd.getSlashCommandJSON());

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
    const messagesPath = path.join(__dirname, "..", "..", "message_commands");

    const cmdPath = path.join(messagesPath, command);
    const cmd = await import(cmdPath);
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
    const { PREFIX } = process.env;
    const command = message.content.split(" ")[0].slice(PREFIX!.length).toLowerCase();
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
      const subCommandHandler = this.#subCommands.get(commandName);
      if (subCommandHandler == undefined) throw "Could not find main subcommand file somehow";

      const runner = subCommandHandler.getSubCommand(subCommandName);
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
      client.commandsUsed.inc(1);
      client.activeCommands.inc(1);
      await runner.run(interaction, client);
      client.activeCommands.dec(1);
    } catch (err) {
      console.error(err);
      client.activeCommands.dec(1);
      client.erroredCommands.inc(1);
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
      client.commandsUsed.inc(1);
      client.activeCommands.inc(1);
      await command.run(interaction, client);
      client.activeCommands.dec(1);
    } catch (err) {
      console.error(err);
      client.activeCommands.dec(1);
      client.erroredCommands.inc(1);
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
      const subCommandGroupInstance = subCommandInstance?.getSubCommand(subCommandGroup);
      if (subCommandGroupInstance == undefined) throw "Error: SubCommand group not found";
      if (!(subCommandGroupInstance instanceof Collection)) return;
      const runner = subCommandGroupInstance.get(subCommandName);
      if (runner == undefined) throw "Error: SubCommand in group not found";
      if (interaction.isAutocomplete()) {
        if (!runner.autocomplete) throw "Missing autocomplete function";
        return runner.autocomplete(interaction, client);
      }

      client.commandsUsed.inc(1);
      client.activeCommands.inc(1);
      await runner.run(interaction, client);
      client.activeCommands.dec(1);
    } catch (err) {
      console.error(err);
      client.activeCommands.dec(1);
      client.erroredCommands.inc(1);
    }
  }
}
