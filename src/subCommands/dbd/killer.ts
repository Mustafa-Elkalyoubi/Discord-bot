import ExtendedClient from "../../utils/Client";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner";
import {
  APIEmbedField,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  RestOrArray,
} from "discord.js";
import path from "node:path";
import { dbdKiller } from "../../types";

function capitalizeFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async autocomplete(interaction: AutocompleteInteraction, client: ExtendedClient) {
    const focusedValue = interaction.options.getFocused() ?? "";
    const filtered = client.dbdChars.filter(
      (char) =>
        char.name.toLowerCase().includes(focusedValue.toLowerCase()) && char.role === "killer"
    );

    if (!filtered) return interaction.respond([]);

    if (filtered.length <= 25)
      return interaction.respond(filtered.map((char) => ({ name: char.name, value: char.name })));

    interaction.respond(
      filtered.slice(0, 25).map((perk) => ({ name: perk.name, value: perk.name }))
    );
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const killer = client.dbdChars.find(
      (char) => char.name === interaction.options.getString("killer")!
    ) as dbdKiller;
    if (!killer)
      return interaction.reply({
        content: "Sorry, couldn't find the killer for some reason",
        ephemeral: true,
      });

    const power = client.dbdPowers.find((power) => power.id === killer.item);
    if (!power)
      return interaction.reply({
        content: "Sorry, couldn't find the power for some reason",
        ephemeral: true,
      });

    const assetPath = path.join(__dirname, "..", "..", "assets");
    const killerImgPath = path.join(assetPath, killer.image);
    const killerImgName = path.basename(killerImgPath);

    const powerImgPath = path.join(assetPath, power.image);
    const powerImgName = path.basename(powerImgPath);

    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setColor("Random")
      .setTitle(killer.name)
      .setDescription(`__**${power.name}**__\n\n${power.description}`)
      .setImage(`attachment://${powerImgName}`)
      .setThumbnail(`attachment://${killerImgName}`)
      .setTimestamp();

    interaction.reply({ embeds: [embed], files: [killerImgPath, powerImgPath] });
  }
}
