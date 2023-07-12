import { DateTime } from "luxon";
import ExtendedClient from "../../../utils/Client";
import BaseSubCommandRunner from "../../../utils/BaseSubCommandRunner";
import { ChatInputCommandInteraction } from "discord.js";

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const message = interaction.options.getString("message")!;
    const day = interaction.options.getInteger("day");
    const month = interaction.options.getInteger("month");
    const year = interaction.options.getInteger("year");
    var hour = interaction.options.getInteger("hour");
    const minute = interaction.options.getInteger("minute");
    const meridiem = interaction.options.getString("meridiem");
    if (!day && !month && !year && !hour && !minute)
      return interaction.reply({ content: "Well you have to put something", ephemeral: true });

    if (message.length >= 1000)
      return interaction.reply({
        content: "Error, message is too long",
        ephemeral: true,
      });

    if (meridiem && hour) {
      if (hour > 12)
        return interaction.reply({
          content: `Yeah bozo, let me just set a reminder for ${hour + 12} pm`,
        });
      hour += 12;
    }

    const timeToRemind = DateTime.fromObject({
      ...(day && { day: day }),
      ...(month && { month: month }),
      ...(year && { year: year }),
      ...(hour && { hour: hour }),
      ...(minute && { minute: minute }),
    }).toMillis();

    if (DateTime.now().toMillis() > timeToRemind)
      return interaction.reply({ content: "That time is in the past", ephemeral: true });

    client.saveReminder(interaction, message, timeToRemind);
  }
}
