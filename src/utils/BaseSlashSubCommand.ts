import { Collection } from "discord.js";

type SubCommandGroup = {
  name: string;
  subCommands: Array<string>;
};

export default class BaseSlashSubCommand {
  private _name: string;
  private _groups: Array<SubCommandGroup | null>;
  private _subCommands: Array<string | null>;
  private _groupCommands: Collection<string, Collection<string, SubCommand> | SubCommand>;
  private _all: boolean;

  constructor(
    name: string,
    groups: Array<SubCommandGroup | null>,
    subcommands: Array<string | null>,
    dev = false
  ) {
    this._name = name;
    this._groups = groups;
    this._subCommands = subcommands;
    this._groupCommands = new Collection();
    this._all = !dev;
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
