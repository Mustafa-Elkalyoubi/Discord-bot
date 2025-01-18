import { BaseCommand } from "./BaseCommand.js";
import GroupCommand from "./GroupCommand.js";

abstract class SubCommandGroup extends BaseCommand {
  groupCommands: GroupCommand[];

  constructor(name: string, groupCommands: Constructable<GroupCommand>[], dev = false) {
    super(name, dev);
    this.groupCommands = groupCommands.map((cmd) => new cmd());
  }

  abstract getSlashCommandJSON(prev: SlashCommandBuilder): void;
}

export default SubCommandGroup;
