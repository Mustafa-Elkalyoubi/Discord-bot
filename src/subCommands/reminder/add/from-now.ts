import { ChatInputCommandInteraction } from "discord.js";
import { DateTime } from "luxon";
import ExtendedClient from "../../../utils/Client.js";
import GroupCommand from "../../../utils/command/GroupCommand.js";

export default class AddFromNow extends GroupCommand {
  constructor() {
    super("from-now");
  }

  getSlashCommandJSON(prev: SlashCommandGroupBuilder): void {
    prev.addSubcommand((subcommand) =>
      subcommand
        .setName("from-now")
        .setDescription("Set a reminder in a from-now format (e.g. 5 hours from now)")
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("Set the message that will send at the specified time")
            .setRequired(true)
        )
        .addIntegerOption((option) => option.setName("days").setDescription("Day count"))
        .addIntegerOption((option) => option.setName("hours").setDescription("Hour count"))
        .addIntegerOption((option) => option.setName("minutes").setDescription("Minute count"))
    );
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const message = interaction.options.getString("message")!;
    const days = interaction.options.getInteger("days") ?? 0;
    const hours = interaction.options.getInteger("hours") ?? 0;
    const minutes = interaction.options.getInteger("minutes") ?? 0;
    const seconds = interaction.options.getInteger("seconds") ?? 0;

    if (message.length >= 1000)
      return interaction.reply({
        content: "Your message is too long (limit 1k characters)",
        ephemeral: true,
      });

    if (!days && !hours && !minutes && !seconds)
      return interaction.reply({
        content: "Okay, you can't leave all the time options empty lmao",
        ephemeral: true,
      });

    const timeToRemind = DateTime.now().plus({
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    });

    if (DateTime.now() >= timeToRemind)
      return interaction.reply({ content: "That time is in the past", ephemeral: true });

    client.reminders.save!(interaction, message, timeToRemind);
  }
}
