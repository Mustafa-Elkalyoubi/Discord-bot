import { Collection } from "discord.js";
import { BaseCommand } from "./BaseCommand.js";
import SubCommand from "./SubCommand.js";
import SubCommandGroup from "./SubCommandGroup.js";
import GroupCommand from "./GroupCommand.js";

abstract class SubCommandHandler extends BaseCommand {
  groups: SubCommandGroup[];
  subCommands: SubCommand[];
  abstract getSlashCommandJSON(): TextCommandJSON;

  #collection: Collection<string, SubCommand | GroupCommand>;

  constructor(
    name: string,
    groups: Constructable<SubCommandGroup>[],
    subCommands: Constructable<SubCommand>[],
    dev = false
  ) {
    super(name, dev);

    this.groups = groups.map((g) => new g());
    this.subCommands = subCommands.map((cmd) => new cmd());

    this.#collection = new Collection();

    this.groups.forEach((group) => {
      group.groupCommands.forEach((cmd) => {
        this.#collection.set(cmd.name, cmd);
      });
    });

    this.subCommands.forEach((cmd) => {
      this.#collection.set(cmd.name, cmd);
    });
  }

  getSubCommand(name: string): SubCommand | GroupCommand | undefined {
    return this.#collection.get(name);
  }

  protected addSubCommandJSON = (builder: SlashCommandBuilder): void => {
    this.groups.forEach((group) => {
      group.getSlashCommandJSON(builder);
    });

    this.subCommands.forEach((cmd) => {
      cmd.getSlashCommandJSON(builder);
    });
  };
}
export default SubCommandHandler;
