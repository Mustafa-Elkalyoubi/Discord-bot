import axios from "axios";
import {
  AttachmentBuilder,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { DateTime } from "luxon";
import sharp from "sharp";
import OsrsItem from "../models/OsrsItem";
import { BaseCommand } from "../utils/BaseCommand";
import ExtendedClient from "../utils/Client";

type GETimeseriesResponse = {
  data: {
    timestamp: number;
    avgHighPrice: number;
    avgLowPrice: number;
    highPriceVolume: number;
    lowPriceVolume: number;
  }[];
};

type GELatestResponse = {
  data: {
    [k: string]: {
      high: number;
      low: number;
      highTime: number;
      lowTime: number;
    };
  };
};

enum TimeFrame {
  "1 day" = "5m",
  "7 days" = "1h",
  "30 days" = "6h",
  "1 year" = "24h",
}

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
            { name: "1 day (default)", value: "1 day" },
            { name: "7 days", value: "7 days" },
            { name: "30 days", value: "30 days" },
            { name: "1 year", value: "1 year" }
          )
          .setRequired(false)
      )
      .toJSON();
  }

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused() ?? "";

    const items = await OsrsItem.find({ name: { $regex: focusedValue, $options: "i" } })
      .sort({ name: "asc" })
      .limit(25);

    if (!items) return interaction.respond([]);

    return interaction.respond(
      items.map((item) => ({
        name: item.name,
        value: item.name,
      }))
    );
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const item = await OsrsItem.findOne({
      name: interaction.options.getString("item")!,
    });

    if (!item)
      return interaction.reply({
        content: `Item [${item}] was not found (make sure you select the item from the list)`,
        ephemeral: true,
      });

    await interaction.deferReply();

    const { name: itemName, id: itemID } = item;

    const tf = (interaction.options.getString("timeframe") ?? "1 day") as keyof typeof TimeFrame;

    const url = `https://prices.runescape.wiki/api/v1/osrs`;

    const seriesRes = axios
      .get<GETimeseriesResponse>(`${url}/timeseries`, {
        headers: { "User-Agent": "Discord Bot - birbkiwi" },
        params: { timestep: TimeFrame[tf], id: itemID },
      })
      .then(async function (res) {
        const obj = res.data;
        return obj.data;
      })
      .catch((e: Error) => console.error(e));

    const latestRes = axios
      .get<GELatestResponse>(`${url}/latest`, {
        headers: { "User-Agent": "Discord Bot - birbkiwi" },
        params: { id: itemID },
      })
      .then((res) => res.data.data[itemID]!)
      .catch((e: Error) => console.error(e));

    const [series, latest] = await Promise.all([seriesRes, latestRes]);

    const spriteURL = `https://secure.runescape.com/m=itemdb_oldschool/obj_big.gif?id=${itemID}`;
    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(itemName)
      .setURL(`https://prices.runescape.wiki/osrs/item/${itemID}`)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setFooter({ text: "GE Activity" })
      .setThumbnail(spriteURL)
      .setTimestamp();

    if (latest) {
      embed.addFields(
        {
          name: "Average",
          value: `**${abbreviate((latest.high + latest.low) / 2)}**`,
        },
        {
          name: `High <t:${latest.highTime}:R>`,
          value: `**${abbreviate(latest.high)}** gp`,
          inline: true,
        },
        {
          name: `Low <t:${latest.lowTime}:R>`,
          value: `**${abbreviate(latest.low)}** gp`,
          inline: true,
        }
      );
    }

    if (series && series.length > 0) {
      const chart = await generateChart(series, tf, client);
      const img = await svgToPng(chart);
      if (img) {
        const attachment = new AttachmentBuilder(img, { name: "chart.png" });

        embed.addFields({ name: `Timeframe`, value: tf });
        embed.setImage(`attachment://chart.png`);

        return interaction.editReply({ embeds: [embed], files: [attachment] });
      }
    }

    return interaction.editReply({ embeds: [embed] });
  }
}

async function generateChart(
  data: GETimeseriesResponse["data"],
  tf: keyof typeof TimeFrame,
  client: ExtendedClient
) {
  const labels: DateTime[] = [];
  const highPrices: (number | null)[] = [];
  const lowPrices: (number | null)[] = [];

  data.forEach((dataPoint) => {
    highPrices.push(dataPoint.avgHighPrice);
    lowPrices.push(dataPoint.avgLowPrice);
    labels.push(DateTime.fromSeconds(dataPoint.timestamp));
  });

  let unit: "hour" | "day" | "week" | "month" = "hour";
  switch (tf) {
    case "1 day":
      break;
    case "7 days":
      unit = "day";
      break;
    case "30 days":
      unit = "week";
      break;
    case "1 year":
      unit = "month";
      break;
  }

  return client.GECanvas.renderToBufferSync({
    type: "line",
    options: {
      backgroundColor: "#FF0000",
      color: "white",
      scales: {
        y: {
          grid: {
            drawTicks: false,
            color: "#FFFFFF30",
            lineWidth: 1,
          },
          ticks: {
            color: "white",
            includeBounds: true,
          },
        },
        x: {
          type: "time",
          time: {
            unit,
          },
          grid: {
            color: "#FFFFFF30",
            drawTicks: false,
            lineWidth: 1,
          },
          ticks: {
            color: "white",
            includeBounds: true,
            maxTicksLimit: 7,
          },
        },
      },
    },
    data: {
      labels,
      datasets: [
        {
          label: "High Price",
          data: highPrices,
          backgroundColor: "#ffa430",
          borderColor: "#ffa430",
          cubicInterpolationMode: "default",
          borderWidth: 1,
          pointRadius: 2,
        },
        {
          label: "Low Price",
          data: lowPrices,
          backgroundColor: "#31ff5f",
          borderColor: "#31ff5f",
          cubicInterpolationMode: "default",
          borderWidth: 1,
          pointRadius: 2,
        },
      ],
    },
  });
}

function svgToPng(svg: Buffer): Promise<Buffer> {
  return sharp(svg, { animated: false }).png().toBuffer();
}

function abbreviate(num: number) {
  if (num < 10000000) return num.toLocaleString("en-US");
  return num.toLocaleString("en-US", {
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
