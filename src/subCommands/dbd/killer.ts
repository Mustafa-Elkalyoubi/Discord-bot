import { AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner.js";
import ExtendedClient from "../../utils/Client.js";
import path from "path";

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async autocomplete(interaction: AutocompleteInteraction, client: ExtendedClient) {
    const focusedValue = interaction.options.getFocused() ?? "";
    const characters = await client.dbd.findCharacterByName(focusedValue, 25, "killer");

    return interaction.respond(characters.map((char) => ({ name: char.name, value: char.name })));
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const killer = await client.dbd.findCharacterByName(
      interaction.options.getString("killer", true)
    );

    if (!killer || !killer.item)
      return interaction.reply({ content: "Killer not found in db", ephemeral: true });

    const killerIMGURL = `${client.dbd.assetURL}${killer.image}`;
    const powerIMGURL = `${client.dbd.assetURL}${killer.item.image}`;

    console.log(killerIMGURL);

    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setColor("Random")
      .setTitle(killer.name)
      .setDescription(`__**${killer.item.name}**__\n\n${killer.item.description}`)
      .setImage(killerIMGURL)
      .setThumbnail(powerIMGURL)
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  }
}
