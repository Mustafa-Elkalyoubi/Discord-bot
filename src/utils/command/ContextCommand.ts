import { BaseCommand } from "./BaseCommand.js";

abstract class ContextCommand extends BaseCommand {
  abstract run(interaction: MessageContextMenuCommandInteraction, client: ExtendedClient): unknown;
  abstract getSlashCommandJSON(): ContextCommandJSON;
}

export default ContextCommand;
