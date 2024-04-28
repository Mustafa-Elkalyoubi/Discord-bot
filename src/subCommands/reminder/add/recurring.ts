import BaseSubCommandRunner from "../../../utils/BaseSubCommandRunner";
import { ChatInputCommandInteraction } from "discord.js";
import ExtendedClient from "../../../utils/Client";

enum Recurring {
  sun = 0,
  mon = 1,
  tue = 2,
  wed = 3,
  thur = 4,
  fri = 5,
  sat = 6,
}

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    interaction.reply("not built yet");
    const message = interaction.options.getString("message", true);
    const day = Recurring[interaction.options.getString("day", true) as keyof typeof Recurring];
    let hour = interaction.options.getInteger("hour", true);
    const minute = interaction.options.getInteger("minute", true);
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
