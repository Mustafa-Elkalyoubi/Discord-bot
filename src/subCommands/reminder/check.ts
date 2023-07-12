import ExtendedClient from "../../utils/Client";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const userID = interaction.user.id;
    const reminders = client.reminders[userID];

    if (!reminders)
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
          return {
            name: `ID: \`${reminder.id}\``,
            value: `${reminder.recurring ? "`Recurring` " : ""}Message <t:${Math.floor(
              reminder.timeToRemind / 1000
            )}:R>: ${reminder.message}`,
            inline: true,
          };
        })
      );

    interaction.reply({ embeds: [reminderEmbed] });
  }
}
