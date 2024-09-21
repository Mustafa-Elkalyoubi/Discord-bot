import { Collection } from "discord.js";

type SubCommandGroup = {
  name: string;
  subCommands: Array<new (baseCommand: string, group: string) => SubCommand>;
};

export default class BaseSlashSubCommand {
  private _name: string;
  private _groups: Array<SubCommandGroup>;
  private _subCommands: Array<string | null>;
  private _groupCommands: Collection<string, Collection<string, SubCommand> | SubCommand>;
  private _all: boolean;

  constructor(
    name: string,
    groups: Array<SubCommandGroup>,
    subcommands: Array<new (baseCommand: string) => SubCommand>,
    dev = false
  ) {
    this._name = name;
    this._groups = groups;
    this._subCommands = [];
    this._groupCommands = new Collection();
    this._all = !dev;

    subcommands.forEach((Subcommand) => {
      const cmd = new Subcommand(name);

      this._subCommands.push(cmd.name);
      this._groupCommands.set(cmd.name, cmd);
    });

    groups.forEach((group) => {
      const newColl = new Collection<string, SubCommand>();
      this._groupCommands.set(group.name, newColl);
      group.subCommands.forEach((Subcommand) => {
        const cmd = new Subcommand(name, group.name);

        newColl.set(cmd.name, cmd);
      });
    });
  }

  get name() {
    return this._name;
  }

  get groups() {
    return this._groups;
  }

  get subCommands() {
    return this._subCommands;
  }

  get groupCommands() {
    return this._groupCommands;
  }

  get all() {
    return this._all;
  }
}
