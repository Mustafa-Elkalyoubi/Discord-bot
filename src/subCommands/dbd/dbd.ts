import { SlashCommandBuilder } from "discord.js";
import BaseSlashSubCommand from "../../utils/BaseSlashSubCommand.js";

export default class BaseSubCommand extends BaseSlashSubCommand {
  constructor() {
    super("dbd", [], ["perk", "shrine", "killer"]);
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
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("killer")
          .setDescription("Search for a killer and their power")
          .addStringOption((option) =>
            option
              .setName("killer")
              .setDescription("the killer whomst've'd power you want to search bozo")
              .setChoices()
              .setAutocomplete(true)
              .setRequired(true)
          )
      );
  }
}
