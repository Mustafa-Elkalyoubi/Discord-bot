type BaseCommand = import("./BaseCommand.ts").BaseCommand;
type ExtendedClient = import("../Client.ts").default;

type Message = import("discord.js").Message;

type SlashCommandBuilder = import("discord.js").SlashCommandBuilder;
type SlashCommandGroupBuilder = import("discord.js").SlashCommandSubcommandGroupBuilder;
type TextCommandJSON = import("discord.js").RESTPostAPIChatInputApplicationCommandsJSONBody;
type ContextCommandJSON = import("discord.js").RESTPostAPIContextMenuApplicationCommandsJSONBody;

type ChatInputCommandInteraction = import("discord.js").ChatInputCommandInteraction;
type MessageContextMenuCommandInteraction =
  import("discord.js").MessageContextMenuCommandInteraction;
type AutocompleteInteraction = import("discord.js").AutocompleteInteraction;

type MessageCommand = {
  run(message: Message, args: string[], client?: ExtendedClient): void;
  conf: {
    aliases: Array<string>;
    permLevel: number;
  };
  help: {
    name: string;
    description: string;
    usage: string;
  };
};
