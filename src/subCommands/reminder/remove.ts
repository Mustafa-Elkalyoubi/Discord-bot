import ExtendedClient from "../../utils/Client";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner";
import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async autocomplete(interaction: AutocompleteInteraction, client: ExtendedClient) {
    const reminders = client.reminders.get(interaction.user.id);
    if (!reminders) return interaction.respond([]);

    const focusedValue = interaction.options.getFocused();

    const filtered = reminders.filter((reminder) =>
      reminder.id.toString().startsWith(focusedValue.toString())
    );

    if (filtered.length <= 25)
      return await interaction.respond(
        filtered.map((reminder) => ({
          name: `${reminder.id} (${reminder.message.slice(0, 20).trim()}${
            reminder.message.length > 20 ? "..." : ""
          })`,
          value: `${reminder.id}`,
        }))
      );

    if (focusedValue.length === 0)
      await interaction.respond(
        reminders.slice(0, 25).map((reminder) => ({
          name: `${reminder.id} (${reminder.message.slice(0, 20).trim()}${
            reminder.message.length > 20 ? "..." : ""
          })`,
          value: `${reminder.id}`,
        }))
      );
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const userID = interaction.user.id;
    const reminders = client.reminders.get(userID);
    const reminderID = parseInt(interaction.options.getString("id")!);

    if (!reminders)
      return interaction.reply({
        content: "You havent set any reminders",
        ephemeral: true,
      });

    const reminderToRemove = reminders.find((reminder) => reminder.id === reminderID);

    if (!reminderToRemove)
      return interaction.reply({
        content: `Could not find a reminder with id [${reminderID}]`,
        ephemeral: true,
      });

    client.deleteReminder(reminderID, userID);
    interaction.reply({ content: `Removed reminder [${reminderID}]` });
    client.reloadTimeouts();
  }
}
