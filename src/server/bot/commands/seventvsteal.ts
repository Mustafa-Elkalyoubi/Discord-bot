import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import BaseCommand from "../utils/BaseCommand.js";
import { steal7TV } from "../utils/steal7tv.js";

export default class SevenTVSteal extends BaseCommand implements Command {
  constructor() {
    super("seventvsteal");
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Steals an emote from 7tv")
      .addStringOption((option) =>
        option.setName("url").setDescription("7tv url").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("name").setDescription("Manually input the emote name")
      )
      .toJSON();
  }

  async run(interaction: ChatInputCommandInteraction) {
    const url = interaction.options.getString("url")!;
    const emoteName = interaction.options.getString("name") ?? "";

    if (!url.includes("7tv.app"))
      return interaction.reply({ content: "Not a 7tv.app link", ephemeral: true });

    await interaction.deferReply();

    return steal7TV(interaction, url, emoteName);
  }
}
