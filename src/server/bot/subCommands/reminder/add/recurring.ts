import BaseSubCommandRunner from "../../../utils/BaseSubCommandRunner.js";
import { ChatInputCommandInteraction } from "discord.js";
import ExtendedClient from "../../../utils/Client.js";

enum Recurring {
  sun = 0,
  mon = 1,
  tue = 2,
  wed = 3,
  thur = 4,
  fri = 5,
  sat = 6,
}

class RecurringReminderSubCommand extends BaseSubCommandRunner implements SubCommand {
  constructor(baseCommand: string, group: string) {
    super(baseCommand, group, "recurring");
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

export default RecurringReminderSubCommand;
