import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import SubCommandHandler from "../../utils/command/SubCommandHandler.js";
import RemoveReminder from "./remove.js";
import AddReminderSubCommandGroup from "./add/Add.js";
import CheckReminder from "./check.js";

export default class ReminderBaseCommand extends SubCommandHandler {
  constructor() {
    super("reminder", [AddReminderSubCommandGroup], [RemoveReminder, CheckReminder]);
  }

  getSlashCommandJSON() {
    const builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("reminder commands")
      .setContexts([InteractionContextType.Guild]);

    this.addSubCommandJSON(builder);

    return builder.toJSON();
  }
}
