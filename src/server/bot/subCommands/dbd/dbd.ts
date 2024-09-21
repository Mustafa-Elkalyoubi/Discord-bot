import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import BaseSlashSubCommand from "../../utils/BaseSlashSubCommand.js";
import PerkSubCommand from "./perk.js";
import KillerSubCommand from "./killer.js";
import ShrineSubCommand from "./shrine.js";

export default class DBDMainCommand extends BaseSlashSubCommand implements BaseSubCommand {
  constructor() {
    super("dbd", [], [PerkSubCommand, KillerSubCommand, ShrineSubCommand]);
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("dbd commands")
      .setContexts(InteractionContextType.Guild)
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
      )
      .toJSON();
  }
}
