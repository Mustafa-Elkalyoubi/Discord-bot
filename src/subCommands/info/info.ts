import { SlashCommandBuilder } from "discord.js";
import SubCommandHandler from "../../utils/command/SubCommandHandler.js";
import ServerInfo from "./server.js";
import UserInfo from "./user.js";

export default class InfoBaseCommand extends SubCommandHandler {
  constructor() {
    super("info", [], [ServerInfo, UserInfo]);
  }

  getSlashCommandJSON() {
    const builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("info commands")
      .setDMPermission(false);

    this.addSubCommandJSON(builder);

    return builder.toJSON();
  }
}
