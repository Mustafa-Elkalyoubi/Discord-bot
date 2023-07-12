import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  EmbedBuilder,
} from "discord.js";
import { BaseCommand } from "../utils/BaseCommand";
import ExtendedClient from "../utils/Client";
import { fetchItem } from "../utils/Request";

export default class Command extends BaseCommand {
  constructor() {
    super("ge");
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Search the Grand Exchange")
      .addStringOption((option) =>
        option
          .setName("item")
          .setDescription("The item's name")
          .setRequired(true)
          .setAutocomplete(true)
      )
      .addStringOption((option) =>
        option
          .setName("timeframe")
          .setDescription("pick the timeframe")
          .addChoices(
            { name: "Latest", value: "latest" },
            { name: "Hour (Default)", value: "hour" }
          )
          .setRequired(false)
      )
      .toJSON();
  }

  async autocomplete(interaction: AutocompleteInteraction, client: ExtendedClient) {
    const items = client.osrsItems;

    const focusedValue = interaction.options.getFocused() ?? "";
    const filtered = items?.filter((item) =>
      item.name.toLowerCase().includes(focusedValue.toLowerCase())
    );

    if (!filtered) return;

    if (filtered.length <= 25)
      return interaction.respond(
        filtered.map((item) => ({
          name: item.name,
          value: item.name,
        }))
      );

    interaction.respond(
      filtered.slice(0, 25).map((item) => ({
        name: item.name,
        value: item.name,
      }))
    );
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const item = client.osrsItems.find(
      (item) => item.name.toLowerCase() === interaction.options.getString("item")!.toLowerCase()
    );

    if (!item)
      return interaction.reply({
        content: `Item [${item}] was not found (make sure you select the item from the list)`,
        ephemeral: true,
      });

    await interaction.deferReply();

    const { name: itemName, value: itemID } = item;
    var timeFrame = {
      latest: "latest",
      hour: "1h",
    };
    const tf = (interaction.options.getString("timeframe") ?? "hour") as keyof typeof timeFrame;

    const url = `https://prices.runescape.wiki/api/v1/osrs/${timeFrame[tf]}`;
    var config = {
      headers: { "User-Agent": "Discord Bot - Jiggly Jelly#6009" },
      params: { id: itemID },
    };

    var prices;
    try {
      prices = await fetchItem(url, config)
        .then(async function (res) {
          const obj = await res.json();
          return obj.data[itemID];
        })
        .catch((e: Error) => console.error(e));
    } catch (error: any) {
      if (error.code === "ETIMEDOUT")
        return interaction.editReply("Sorry, the servers seem to be having issues");
      console.error(error);
    }

    if (!prices) {
      return interaction.editReply(
        "Sorry, that item hasnt been traded in the past hour, try changing the timeframe to latest"
      );
    }

    const spriteURL = `https://secure.runescape.com/m=itemdb_oldschool/obj_big.gif?id=${itemID}`;

    var embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(itemName)
      .setURL(`https://prices.runescape.wiki/osrs/item/${itemID}`)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setFooter({ text: "GE Activity" })
      .setThumbnail(spriteURL)
      .setTimestamp();

    if (tf === "latest")
      embed.addFields(
        {
          name: "Average",
          value: `**${abbreviate((prices.high + prices.low) / 2)}**`,
          inline: true,
        },
        { name: `High <t:${prices.highTime}:R>`, value: `**${abbreviate(prices.high)}** gp` },
        { name: `Low <t:${prices.lowTime}:R>`, value: `**${abbreviate(prices.low)}** gp` }
      );
    else if (tf === "hour")
      embed.addFields(
        {
          name: `High Avg (Volume: ${abbreviate(prices.highPriceVolume)})`,
          value: `**${abbreviate(prices.avgHighPrice)}** gp`,
          inline: true,
        },
        {
          name: `Low Avg (Volume: ${abbreviate(prices.lowPriceVolume)})`,
          value: `**${abbreviate(prices.avgLowPrice)}** gp`,
          inline: true,
        }
      );

    return interaction.editReply({ embeds: [embed] });
  }
}

function abbreviate(num: number) {
  if (num < 10000000) return num.toLocaleString("en-US");
  return num.toLocaleString("en-US", {
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
