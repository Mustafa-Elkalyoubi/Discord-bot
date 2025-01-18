import SubCommandGroup from "../../../utils/command/SubCommandGroup.js";
import AddAt from "./at.js";
import AddFromNow from "./from-now.js";
import AddRecurring from "./recurring.js";

class AddReminderSubCommandGroup extends SubCommandGroup {
  constructor() {
    super("add", [AddFromNow, AddAt, AddRecurring]);
  }

  getSlashCommandJSON(prev: SlashCommandBuilder): void {
    prev.addSubcommandGroup((group) => {
      group.setName("add").setDescription("Add a new reminder");

      this.groupCommands.forEach((cmd) => cmd.getSlashCommandJSON(group));

      return group;
    });
  }
}

export default AddReminderSubCommandGroup;
