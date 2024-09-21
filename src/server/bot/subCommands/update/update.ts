import { SlashCommandBuilder } from "discord.js";
import BaseSlashSubCommand from "../../utils/BaseSlashSubCommand.js";
import UpdateOSRSSubCommand from "./osrs.js";
import UpdateDBDSubCommand from "./dbd.js";

export default class UpdateMainCommand extends BaseSlashSubCommand implements BaseSubCommand {
  constructor() {
    super("update", [], [UpdateOSRSSubCommand, UpdateDBDSubCommand], true);
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("dbd commands")
      .setDMPermission(false)
      .addSubcommand((subcommand) => subcommand.setName("dbd").setDescription("update dbd perks"))
      .addSubcommand((subcommand) => subcommand.setName("osrs").setDescription("update osrs items"))
      .toJSON();
  }
}
