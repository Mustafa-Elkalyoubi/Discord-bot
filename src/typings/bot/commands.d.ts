type ExtendedClient = import("@bot/utils/Client").default;

declare function AutocompleteHandler(
  interaction: import("discord.js").AutocompleteInteraction,
  client?: ExtendedClient
): Promise<unknown>;

type BaseCommand = import("@bot/utils/BaseCommand").default;
interface Command extends BaseCommand {
  getSlashCommandJSON(): import("discord.js").RESTPostAPIChatInputApplicationCommandsJSONBody;
  run(
    interaction: import("discord.js").ChatInputCommandInteraction,
    client?: ExtendedClient
  ): Promise<unknown> | unknown;
  autocomplete?: autocompleteHandler;
}

type BaseSlashSubCommand = import("@bot/utils/BaseSlashSubCommand.js").default;
interface BaseSubCommand extends BaseSlashSubCommand {
  getSlashCommandJSON(): import("discord.js").RESTPostAPIChatInputApplicationCommandsJSONBody;
}

type BaseSubCommandRunner = import("@bot/utils/BaseSubCommandRunner").default;
interface SubCommand extends BaseSubCommandRunner {
  run(
    interaction: import("discord.js").ChatInputCommandInteraction,
    client?: ExtendedClient
  ): Promise<unknown>;
  autocomplete?: AutocompleteHandler;
}

interface ContextCommand {
  all: boolean;
  constructor: void;
  getContextCommandJSON(): import("discord.js").RESTPostAPIChatInputApplicationCommandsJSONBody;
  run(
    interaction: import("discord.js").MessageContextMenuCommandInteraction,
    client?: ExtendedClient
  ): Promise<void>;
}

type MessageCommandRun = (
  message: import("discord.js").Message,
  args: string[],
  client: ExtendedClient
) => unknown | Promise<unknown>;

interface MessageCommandConfig {
  aliases: string[];
  permLevel: number;
}

interface MessageCommandHelp {
  name: string;
  description: string;
  usage: string;
}

interface MessageCommand {
  run: MessageCommandRun;
  conf: MessageCommandConfig;
  help: MessageCommandHelp;
}
