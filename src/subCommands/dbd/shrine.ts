import axios from "axios";
import { APIEmbedField, ChatInputCommandInteraction, EmbedBuilder, RestOrArray } from "discord.js";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner.js";
import ExtendedClient from "../../utils/Client.js";

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

    const perks = await client.dbd.findPerkById(res.data.perks.map((p) => p.id));

    if (!perks || perks.length < 4) {
      console.error(
        `One or more missing perks from db. Stored: [${perks
          .map((p) => p.id)
          .toString()}], API: [${res.data.perks.map((p) => p.id).toString()}]`
      );
      return interaction.editReply("Failed to fetch perks");
    }

    res.data.perks.forEach((val, index) => {
      if (index % 2 === 0) fields.push({ name: "\u200B", value: "\u200B", inline: true });
      fields.push({
        name: `Perk #${index + 1}`,
        value: perks.find((p) => p.id === val.id)?.name ?? "not found",
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
