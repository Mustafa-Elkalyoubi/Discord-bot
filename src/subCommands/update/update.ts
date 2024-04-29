import { SlashCommandBuilder } from "discord.js";
import BaseSlashSubCommand from "../../utils/BaseSlashSubCommand.js";

export default class BaseSubCommand extends BaseSlashSubCommand {
  constructor() {
    super("update", [], ["osrs", "dbd"], true);
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("dbd commands")
      .setDMPermission(false)
      .addSubcommand((subcommand) => subcommand.setName("dbd").setDescription("update dbd perks"))
      .addSubcommand((subcommand) =>
        subcommand.setName("osrs").setDescription("update osrs items")
      );
  }
}
