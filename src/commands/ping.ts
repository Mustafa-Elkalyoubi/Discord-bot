import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import TextCommand from "../utils/command/TextCommand.js";

export default class Ping extends TextCommand {
  constructor() {
    super("ping");
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Replies with pong :)")
      .toJSON();
  }

  run(interaction: ChatInputCommandInteraction) {
    interaction.reply({ content: "Pong!" });
  }
}
