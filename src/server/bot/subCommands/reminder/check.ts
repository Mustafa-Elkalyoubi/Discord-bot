import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { DateTime } from "luxon";
import UserData from "../../models/UserData.js";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner.js";
import cronstrue from "cronstrue";

class CheckSubCommand extends BaseSubCommandRunner implements SubCommand {
  constructor(baseCommand: string, group: string | null = null) {
    super(baseCommand, group, "check");
  }

  async run(interaction: ChatInputCommandInteraction) {
    const userID = interaction.user.id;
    const user = await UserData.findOne({ userID });
    const reminders = user?.reminders;

    if (!user || !reminders || reminders.length < 1)
      return interaction.reply({ content: "You haven't set any reminders", ephemeral: true });

    const reminderEmbed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
        url: interaction.user.displayAvatarURL(),
      })
      .setTitle(`Reminders`)
      .addFields(
        reminders.map((reminder) => {
          if (reminder.recurring)
            return {
              name: `ID: \`${reminder._id.toString()}\``,
              value: `**${cronstrue.toString(
                `${reminder.details.minute} ${reminder.details.hour} * * ${reminder.details.day}`,
                { verbose: true }
              )}**\n${reminder.message}`,
              inline: true,
            };
          return {
            name: `ID: \`${reminder._id.toString()}\``,
            value: `${reminder.recurring ? "`Recurring` " : ""}Message <t:${Math.floor(
              DateTime.fromISO(reminder.timeToRemind.toISOString()).toSeconds()
            )}:R>: ${reminder.message}`,
            inline: true,
          };
        })
      );

    interaction.reply({ embeds: [reminderEmbed] });
  }
}

export default CheckSubCommand;
