import { AutocompleteInteraction, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import path from "node:path";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner";
import ExtendedClient from "../../utils/Client";

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
    const killer = await client.dbd.findCharacterByName(interaction.options.getString("killer")!);

    if (!killer || !killer.item)
      return interaction.reply({ content: "Killer not found in db", ephemeral: true });

    const assetPath = path.join(__dirname, "..", "..", "assets");
    const killerImgPath = path.join(assetPath, killer.image);
    const killerImgName = path.basename(killerImgPath);

    const powerImgPath = path.join(assetPath, killer.item.image);
    const powerImgName = path.basename(powerImgPath);

    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setColor("Random")
      .setTitle(killer.name)
      .setDescription(`__**${killer.item.name}**__\n\n${killer.item.description}`)
      .setImage(`attachment://${powerImgName}`)
      .setThumbnail(`attachment://${killerImgName}`)
      .setTimestamp();

    interaction.reply({ embeds: [embed], files: [killerImgPath, powerImgPath] });
  }
}
