import { Collection, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "./BaseCommand.js";
import GroupCommand from "./GroupCommand.js";

abstract class SubCommandGroup extends BaseCommand {
  #collection: Collection<string, GroupCommand>;

  constructor(name: string, groupCommands: Constructable<GroupCommand>[], dev = false) {
    super(name, dev);
    this.#collection = new Collection(
      groupCommands.map((cmd) => {
        const c = new cmd();
        return [c.name, c];
      })
    );
  }

  abstract getSlashCommandJSON(prev: SlashCommandBuilder): void;

  getCommand(name: string): GroupCommand | undefined {
    return this.#collection.get(name);
  }

  get groupCommands() {
    return this.#collection;
  }
}

export default SubCommandGroup;
