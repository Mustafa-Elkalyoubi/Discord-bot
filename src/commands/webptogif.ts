import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../utils/BaseCommand.js";
import axios from "axios";
import sharp from "sharp";
import { randomUUID } from "node:crypto";

export default class Command extends BaseCommand {
  constructor() {
    super("webptogif");
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Converts a given webp file to a gif file")
      .addAttachmentOption((option) =>
        option.setName("file").setDescription("The file you want to convert")
      )
      .addStringOption((option) =>
        option.setName("url").setDescription("The url to the file you want to convert")
      )
      .toJSON();
  }

  async run(interaction: ChatInputCommandInteraction) {
    const inputFile = interaction.options.getAttachment("file");
    const url = interaction.options.getString("url")!;

    if (!inputFile && !url)
      return interaction.reply({ content: "Pick one of the options bozo", ephemeral: true });

    await interaction.deferReply();
    const bufferObj = await axios.get<Buffer>(inputFile?.url ?? url, {
      responseType: "arraybuffer",
      timeout: 60000,
    });
    if (!bufferObj) return interaction.editReply({ content: "summin went wrong xdd" });

    const gif = await sharp(bufferObj.data, { animated: true }).gif().toBuffer();
    const file = new AttachmentBuilder(gif, { name: `${randomUUID()}.gif` });

    interaction.editReply({
      content: `File Size (approx): \`${gif.byteLength / 1000} KB\``,
      files: [file],
    });
  }
}
