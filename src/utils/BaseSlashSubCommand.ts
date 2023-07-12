import { Collection } from "discord.js";
import { SubCommand } from "../types";

type SubCommandGroup = {
  name: string;
  subCommands: Array<string>;
};

export default class BaseSlashSubCommand {
  _name: string;
  _groups: Array<SubCommandGroup | null>;
  _subCommands: Array<string | null>;
  _groupCommands: Collection<string, Collection<string, SubCommand> | SubCommand>;

  constructor(
    name: string,
    groups: Array<SubCommandGroup | null>,
    subcommands: Array<string | null>
  ) {
    this._name = name;
    this._groups = groups;
    this._subCommands = subcommands;
    this._groupCommands = new Collection();
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
}
