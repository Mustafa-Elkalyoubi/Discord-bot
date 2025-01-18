import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import SubCommandHandler from "../../utils/command/SubCommandHandler.js";
import UpdateDBD from "./dbd.js";
import UpdateOSRS from "./osrs.js";

export default class UpdateBaseCommand extends SubCommandHandler {
  constructor() {
    super("update", [], [UpdateDBD, UpdateOSRS], true);
  }

  getSlashCommandJSON() {
    const builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("dbd commands")
      .setContexts([InteractionContextType.Guild]);

    this.addSubCommandJSON(builder);

    return builder.toJSON();
  }
}
