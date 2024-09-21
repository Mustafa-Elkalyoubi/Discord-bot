import BaseSubCommandRunner from "../../../utils/BaseSubCommandRunner.js";
import { DateTime } from "luxon";
import { ChatInputCommandInteraction } from "discord.js";
import ExtendedClient from "../../../utils/Client.js";

class ReminderFromNowSubCommand extends BaseSubCommandRunner implements SubCommand {
  constructor(baseCommand: string, group: string) {
    super(baseCommand, group, "from-now");
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

export default ReminderFromNowSubCommand;
