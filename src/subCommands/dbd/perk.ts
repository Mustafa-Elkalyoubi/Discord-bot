import ExtendedClient from "../../utils/Client";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner";
import {
  APIEmbedField,
  AttachmentBuilder,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  RestOrArray,
} from "discord.js";
import { DBDCharacter, DBDPerk } from "../../types";
import path from "node:path";
import { DateTime } from "luxon";

function capitalizeFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async autocomplete(interaction: AutocompleteInteraction, client: ExtendedClient) {
    const focusedValue = interaction.options.getFocused() ?? "";
    const filtered = client.dbdPerks.filter((perk) =>
      perk.name.toLowerCase().includes(focusedValue.toLowerCase())
    );

    if (!filtered) return interaction.respond([]);

    if (filtered.length <= 25)
      return interaction.respond(filtered.map((perk) => ({ name: perk.name, value: perk.name })));

    interaction.respond(
      filtered.slice(0, 25).map((perk) => ({ name: perk.name, value: perk.name }))
    );
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const selectedPerk = interaction.options.getString("perk");
    if (!selectedPerk)
      return interaction.reply({ content: "idk how that happened", ephemeral: true });

    var perk: DBDPerk[] = client.dbdPerks.filter((perk) =>
      perk.name.toLowerCase().includes(selectedPerk.toLowerCase())
    );
    if (perk.length < 1) return interaction.reply({ content: "Perk not found", ephemeral: true });

    const embedFields: RestOrArray<APIEmbedField> = [
      {
        name: "Role",
        value: capitalizeFirstLetter(perk[0].role),
        inline: true,
      },
    ];

    const charPerk = client.dbdChars.filter(
      (char) => char.charid === perk[0].character?.toString()
    );

    if (charPerk.length > 0) {
      embedFields.push({
        name: "Character",
        value: charPerk[0].name,
        inline: true,
      });

      if (charPerk[0].dlc !== null) {
        const dlc = client.dbdDLC.filter((dlc) => dlc.id === charPerk[0].dlc)[0];
        embedFields.push(
          {
            name: "DLC",
            value: `[${dlc.name}](https://store.steampowered.com/app/${dlc.steamid})`,
            inline: true,
          },
          {
            name: "Date Added",
            value: DateTime.fromSeconds(dlc.time).toLocaleString(DateTime.DATE_MED),
            inline: true,
          }
        );
      } else embedFields.push({ name: "DLC", value: "Free", inline: true });
    } else embedFields.push({ name: "Character", value: "Global", inline: true });

    const imagePath = path.join(__dirname, "..", "..", "assets", perk[0].image);
    const imgName = path.basename(imagePath);

    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setColor("Random")
      .setTitle(perk[0].name)
      .setDescription(perk[0].description)
      .addFields(embedFields)
      .setThumbnail(`attachment://${imgName}`)
      .setTimestamp();

    interaction.reply({ embeds: [embed], files: [imagePath] });
  }
}
