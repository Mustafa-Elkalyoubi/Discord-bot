import {
  APIEmbedField,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  RestOrArray,
} from "discord.js";
import path from "node:path";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner.js";
import ExtendedClient from "../../utils/Client.js";

const __dirname = (() => {
  const x = path.dirname(decodeURI(new URL(import.meta.url).pathname));
  return path.resolve(process.platform == "win32" ? x.substr(1) : x);
})();

function capitalizeFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async autocomplete(interaction: AutocompleteInteraction, client: ExtendedClient) {
    const focusedValue = interaction.options.getFocused() ?? "";
    const perks = await client.dbd.findPerkByName(focusedValue, 25);

    return interaction.respond(perks.map((perk) => ({ name: perk.name, value: perk.name })));
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const selectedPerk = await client.dbd.findPerkByName(interaction.options.getString("perk")!);

    if (!selectedPerk)
      return interaction.reply({ content: "Perk not found in db", ephemeral: true });

    let character = null;

    const charField = { name: "Character", value: "Global", inline: true };
    const dlcField = [{ name: "DLC", value: "Free", inline: true }];

    const embedFields: RestOrArray<APIEmbedField> = [
      {
        name: "Role",
        value: capitalizeFirstLetter(selectedPerk.role),
        inline: true,
      },
    ];

    if (selectedPerk.character) {
      character = await client.dbd.findCharacterByCharid(selectedPerk.character);
      if (!character) throw "missing character";

      charField.value = character.name;

      if (character.dlc) {
        dlcField[0].value = `[${character.dlc.name}](https://store.steampowered.com/app/${character.dlc.steamid})`;
        dlcField.push({
          name: "Date Added",
          value: `<t:${character.dlc.time}:D>`,
          inline: true,
        });
      }
    }

    embedFields.push(charField, ...dlcField);

    const perkImagePath = path.join(__dirname, "..", "..", "assets", selectedPerk.image);
    const perkImgName = path.basename(perkImagePath);

    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setColor("Random")
      .setTitle(selectedPerk.name)
      .setDescription(selectedPerk.description)
      .addFields(embedFields)
      .setImage(`attachment://${perkImgName}`)
      .setTimestamp();

    if (!character) return interaction.reply({ embeds: [embed], files: [perkImagePath] });

    const charImagePath = path.join(__dirname, "..", "..", "assets", character.image);
    const charImgName = path.basename(charImagePath);
    embed.setThumbnail(`attachment://${charImgName}`);
    interaction.reply({ embeds: [embed], files: [perkImagePath, charImagePath] });
  }
}
