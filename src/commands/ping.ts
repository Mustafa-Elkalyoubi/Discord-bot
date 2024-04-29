import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { BaseCommand } from "../utils/BaseCommand.js";

export default class Command extends BaseCommand {
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
