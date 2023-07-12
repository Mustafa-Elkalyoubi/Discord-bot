import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonInteraction,
  CollectorFilter,
  EmbedBuilder,
} from "discord.js";
import { BaseCommand } from "../utils/BaseCommand";
import { DateTime } from "luxon";

interface pollOptionsObj {
  name: string;
  value: number;
}

export default class Command extends BaseCommand {
  constructor() {
    super("poll");
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Poll something")
      .addStringOption((option) =>
        option.setName("title").setDescription("What are you polling?").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("options").setDescription("Comma separated poll options").setRequired(true)
      )
      .addIntegerOption((option) =>
        option.setName("time").setDescription("Time in minutes until the poll ends (default 10)")
      )
      .toJSON();
  }

  async run(interaction: ChatInputCommandInteraction) {
    const pollTitle = interaction.options.getString("title")!;
    const pollOptions: pollOptionsObj[] = interaction.options
      .getString("options")!
      .replace(/, /g, ",")
      .split(",")
      .map((val) => {
        return { name: val, value: 0 };
      });
    const length = interaction.options.getInteger("time") ?? 10;
    const alreadyVoted: string[] = [];
    const endTime = DateTime.now().plus({ minutes: length }).toSeconds().toFixed(0).toString();

    const baseEmbed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(pollTitle)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    const createNewEmbedObj = (isDone = false) => {
      const newEmbed = EmbedBuilder.from(baseEmbed.toJSON());
      newEmbed.setDescription(`${isDone ? "Ended " : "Ending "}<t:${endTime}:R>`).addFields(
        ...pollOptions.map((option, index) => {
          return {
            name: `${isDone ? "" : `${index}: `}${option.name}`,
            value: `${option.value} votes`,
            inline: true,
          };
        })
      );

      return newEmbed;
    };

    const buttons = pollOptions.map((option, index) => {
      return new ButtonBuilder()
        .setCustomId(option.name)
        .setLabel(index.toString())
        .setStyle(ButtonStyle.Primary);
    });

    const filter: CollectorFilter<any[]> = (btn: ButtonInteraction) => {
      return !alreadyVoted.includes(btn.user.id);
    };

    const collector = interaction.channel?.createMessageComponentCollector({
      filter,
      max: 20,
      time: 1000 * 60 * length,
    });

    const actionRow = new ActionRowBuilder().setComponents(...buttons);

    await interaction.reply({
      embeds: [createNewEmbedObj()],
      // @ts-expect-error
      components: [actionRow],
    });

    collector?.on("collect", async (btn: ButtonInteraction) => {
      const index = pollOptions.findIndex((option) => option.name === btn.customId);
      pollOptions[index].value++;
      alreadyVoted.push(btn.user.id);

      // @ts-expect-error
      btn.update({ embeds: [createNewEmbedObj()], components: [actionRow] });
    });

    collector?.on("ignore", async (btn: ButtonInteraction) => {
      btn.reply({ content: "You already voted", ephemeral: true });
    });

    collector?.on("end", (collection) => {
      pollOptions.sort((a, b) => b.value - a.value);
      interaction.editReply({ components: [], embeds: [createNewEmbedObj(true)] });
    });
  }
}
