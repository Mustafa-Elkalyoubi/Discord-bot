import ExtendedClient from "../../utils/Client";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner";
import { APIEmbedField, ChatInputCommandInteraction, EmbedBuilder, RestOrArray } from "discord.js";
import axios from "axios";

const apiURL = "https://dbd.tricky.lol/api/shrine";
interface apiData {
  id: number;
  perks: { id: string; bloodpoints: number; shards: number }[];
  start: number;
  end: number;
}

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    await interaction.deferReply();
    const res = await axios.get<apiData>(apiURL, {
      headers: { "User-Agent": "Discord bot - birbkiwi" },
    });

    if (res.status !== 200) {
      interaction.editReply("Sorry, something went wrong");
      return console.log(res);
    }

    const fields: RestOrArray<APIEmbedField> = [
      {
        name: "Start",
        value: `<t:${res.data.start}:R>`,
        inline: true,
      },
      {
        name: "End",
        value: `<t:${res.data.end}:R>`,
        inline: true,
      },
    ];

    res.data.perks.forEach((val, index) => {
      if (index % 2 === 0) fields.push({ name: "\u200B", value: "\u200B", inline: true });
      fields.push({
        name: `Perk #${index + 1}`,
        value: client.dbd.perks.filter((perk) => perk.id === val.id)[0]?.name ?? "not found",
        inline: true,
      });
    });

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTitle("This week's shrine")
      .setFields(fields)
      .setTimestamp();

    interaction.editReply({ embeds: [embed] });
  }
}
