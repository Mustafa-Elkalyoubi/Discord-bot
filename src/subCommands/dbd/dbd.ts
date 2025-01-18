import { SlashCommandBuilder } from "discord.js";
import SubCommandHandler from "../../utils/command/SubCommandHandler.js";
import KillerSubCommand from "./killer.js";
import PerkSubCommand from "./perk.js";
import ShrineSubCommand from "./shrine.js";

export default class DBDBaseCommand extends SubCommandHandler {
  constructor() {
    super("dbd", [], [PerkSubCommand, ShrineSubCommand, KillerSubCommand]);
  }

  getSlashCommandJSON() {
    const builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("dbd commands")
      .setDMPermission(false);

    this.addSubCommandJSON(builder);

    return builder.toJSON();
  }
}
