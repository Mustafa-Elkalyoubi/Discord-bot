import { SlashCommandBuilder } from "discord.js";
import BaseSlashSubCommand from "../../utils/BaseSlashSubCommand";

export default class BaseSubCommand extends BaseSlashSubCommand {
  constructor() {
    super("dbd", [], ["perk", "shrine"]);
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("dbd commands")
      .setDMPermission(false)
      .addSubcommand((subcommand) =>
        subcommand
          .setName("perk")
          .setDescription("Search for a specific perk")
          .addStringOption((option) =>
            option
              .setName("perk")
              .setDescription("The name of the perk ya bonobo")
              .setChoices()
              .setAutocomplete(true)
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand.setName("shrine").setDescription("Get the current shrine")
      );
  }
}
