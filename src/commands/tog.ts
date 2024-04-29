import axios from "axios";
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import worlds from "../data/osrsWorlds.js";
import { BaseCommand } from "../utils/BaseCommand.js";

interface TOGData {
  world_number: number;
  hits: number;
  stream_order: string;
}

const apiUrl = "https://www.togcrowdsourcing.com/worldinfo";

export default class Command extends BaseCommand {
  constructor() {
    super("tog");
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Gets the best worlds for tears of guthix")
      .toJSON();
  }

  async run(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const res = await axios.get<TOGData[]>(apiUrl, {
      headers: { "User-Agent": "Discord Bot - birbkiwi" },
    });
    if (res.status !== 200) {
      interaction.editReply("Sorry, something went wrong");
      console.log(res);
    }

    const bestOrder = res.data
      .filter((data) => data.stream_order === "gggbbb")
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 6);
    const secondBestOrder = res.data
      .filter((data) => data.stream_order === "bbbggg")
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 6);

    const bestWorlds = [...bestOrder, ...secondBestOrder];

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTitle("Crowdsourced TOG Worlds")
      .setDescription(`Data retrieved from [here](https://togcrowdsourcing.com)`)
      .setImage("https://oldschool.runescape.wiki/images/Tears_of_Guthix_%28minigame%29.png")
      .addFields(
        bestWorlds.flatMap((data) => ({
          name: `W${data.world_number.toString()} ${
            worlds[data.world_number.toString() as keyof typeof worlds]
          }`,
          value: `• Order: **${data.stream_order}**\n• Hits: \`${data.hits}\``,
          inline: true,
        }))
      )
      .setTimestamp();

    interaction.editReply({ embeds: [embed] });
  }
}
