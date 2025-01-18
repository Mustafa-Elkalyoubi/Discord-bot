import { BaseCommand } from "./BaseCommand.js";

abstract class SubCommand extends BaseCommand {
  abstract run(interaction: ChatInputCommandInteraction, client: ExtendedClient): unknown;
  abstract getSlashCommandJSON(prev: SlashCommandBuilder): void;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  autocomplete(interaction: AutocompleteInteraction, client: ExtendedClient) {
    throw new Error("Not implemented");
  }
}

export default SubCommand;
