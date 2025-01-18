import { ChatInputCommandInteraction } from "discord.js";
import ExtendedClient from "../../../utils/Client.js";
import GroupCommand from "../../../utils/command/GroupCommand.js";

enum Recurring {
  sun = 0,
  mon = 1,
  tue = 2,
  wed = 3,
  thur = 4,
  fri = 5,
  sat = 6,
}

export default class AddRecurring extends GroupCommand {
  constructor() {
    super("recurring");
  }

  getSlashCommandJSON(prev: SlashCommandGroupBuilder): void {
    prev.addSubcommand((subcommand) =>
      subcommand
        .setName("recurring")
        .setDescription(
          "Set a recurring reminder on a specific day of the week at a specific time ( eg Monday 2:00 )"
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("What message do you want to be reminded about?")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("day")
            .setDescription("The day of the week lol")
            .addChoices(
              { name: "Sunday", value: "sun" },
              { name: "Monday", value: "mon" },
              { name: "Tuesday", value: "tue" },
              { name: "Wednesday", value: "wed" },
              { name: "Thursday", value: "thur" },
              { name: "Friday", value: "fri" },
              { name: "Saturday", value: "sat" }
            )
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option
            .setName("hour")
            .setDescription("At what hour do you want to be reminded? (24 hour system default)")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
          option.setName("minute").setDescription("At what minute do you want to be reminded?")
        )
        .addStringOption((option) =>
          option
            .setName("meridiem")
            .setDescription("AM or PM? (optional)")
            .addChoices({ name: "AM", value: "AM" }, { name: "PM", value: "PM" })
        )
    );
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const message = interaction.options.getString("message", true);
    const day = Recurring[interaction.options.getString("day", true) as keyof typeof Recurring];
    let hour = interaction.options.getInteger("hour", true);
    const minute = interaction.options.getInteger("minute") ?? 0;
    const meridiem = interaction.options.getString("meridiem");

    if (meridiem) {
      if (hour > 12)
        return interaction.reply({
          content: `Yeah bozo, let me just set a reminder for ${hour + 12} pm`,
        });
      hour += 12;
    }

    if (message.length >= 1000)
      return interaction.reply({
        content: "Your message is too long (limit 1k characters)",
        ephemeral: true,
      });

    client.reminders.save(interaction, message, { day, hour, minute });
  }
}
