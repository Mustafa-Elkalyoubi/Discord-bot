import ExtendedClient from "../../utils/Client.js";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner.js";
import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import UserData from "../../models/UserData.js";
import { Types } from "mongoose";

class RemoveSubCommand extends BaseSubCommandRunner implements SubCommand {
  constructor(baseCommand: string, group: string | null = null) {
    super(baseCommand, group, "remove");
  }

  async autocomplete(interaction: AutocompleteInteraction, client: ExtendedClient) {
    const reminders = await client.reminders.getUserReminders(interaction.user.id);
    if (!reminders) return interaction.respond([]);

    const focusedValue = interaction.options.getFocused();

    const filtered = reminders.filter((reminder) =>
      reminder._id.toString().startsWith(focusedValue.toString())
    );

    if (filtered.length <= 25)
      return await interaction.respond(
        filtered.map((reminder) => ({
          name: `${reminder._id} (${reminder.message.slice(0, 20).trim()}${reminder.message.length > 20 ? "..." : ""})`,
          value: `${reminder._id}`,
        }))
      );

    if (focusedValue.length === 0)
      await interaction.respond(
        reminders.slice(0, 25).map((reminder) => ({
          name: `${reminder._id} (${reminder.message.slice(0, 20).trim()}${reminder.message.length > 20 ? "..." : ""})`,
          value: `${reminder._id}`,
        }))
      );
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    const userID = interaction.user.id;
    const reminderID = interaction.options.getString("id")!;
    const user = await UserData.findOne({ userID });

    if (!user || !user.reminders || user.reminders.length < 1)
      return interaction.reply({
        content: "You havent set any reminders",
        ephemeral: true,
      });

    if (!user.reminders.some((reminder) => reminder._id.toString() === reminderID))
      return interaction.reply({
        content: `Could not find a reminder with id [${reminderID}]`,
        ephemeral: true,
      });

    await client.reminders.remove(new Types.ObjectId(reminderID), userID);
    interaction.reply({ content: `Removed reminder [${reminderID}]` });
  }
}

export default RemoveSubCommand;
