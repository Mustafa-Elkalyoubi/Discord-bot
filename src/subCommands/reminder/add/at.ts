import { ChatInputCommandInteraction } from "discord.js";
import { DateTime } from "luxon";
import ExtendedClient from "../../../utils/Client.js";
import GroupCommand from "../../../utils/command/GroupCommand.js";

export default class AddAt extends GroupCommand {
  constructor() {
    super("at");
  }

  getSlashCommandJSON(prev: SlashCommandGroupBuilder): void {
    prev.addSubcommand((subcommand) =>
      subcommand
        .setName("at")
        .setDescription("Set a reminder at a specific date and/or time (e.g. 2:00 pm on 20/2/2012")
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("Set the message that will send at the specified time")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName("day").setDescription("Day (default is today)")
        )
        .addIntegerOption((option) =>
          option.setName("month").setDescription("Month (default is this month)")
        )
        .addIntegerOption((option) =>
          option.setName("year").setDescription("Year (default is this year)")
        )
        .addIntegerOption((option) =>
          option.setName("hour").setDescription("Hour (default is 00:00)")
        )
        .addIntegerOption((option) => option.setName("minute").setDescription("Minute"))
        .addStringOption((option) =>
          option
            .setName("meridiem")
            .setDescription("AM or PM")
            .addChoices({ name: "AM", value: "AM" }, { name: "PM", value: "PM" })
        )
    );
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const message = interaction.options.getString("message")!;
    const day = interaction.options.getInteger("day");
    const month = interaction.options.getInteger("month");
    const year = interaction.options.getInteger("year");
    let hour = interaction.options.getInteger("hour");
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
    });

    if (DateTime.now() >= timeToRemind)
      return interaction.reply({ content: "That time is in the past", ephemeral: true });

    client.reminders.save(interaction, message, timeToRemind);
  }
}
