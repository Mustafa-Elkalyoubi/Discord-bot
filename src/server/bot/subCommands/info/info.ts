import { SlashCommandBuilder } from "discord.js";
import BaseSlashSubCommand from "../../utils/BaseSlashSubCommand.js";
import ServerSubCommand from "./server.js";

export default class InfoMainCommand extends BaseSlashSubCommand implements BaseSubCommand {
  constructor() {
    super("info", [], [ServerSubCommand]);
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("info commands")
      .setDMPermission(false)
      .addSubcommand((subcommand) =>
        subcommand
          .setName("user")
          .setDescription("Get a user's information")
          .addUserOption((option) =>
            option
              .setName("user")
              .setDescription("Select a user (empty for yourself)")
              .setRequired(false)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand.setName("server").setDescription("Get the server's information")
      )
      .toJSON();
  }
}
