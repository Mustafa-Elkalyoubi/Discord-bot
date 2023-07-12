import BaseSlashSubCommand from "./BaseSlashSubCommand";
type SubCommandGroup = {
  name: string;
  subcommands: Array<string>;
};
export default class BaseSubCommandRunner {
  _baseCommand: BaseSlashSubCommand | string;
  _group: Array<SubCommandGroup | null> | string;
  _name: string;

  constructor(
    baseCommand: BaseSlashSubCommand | string,
    group: Array<SubCommandGroup | null> | string,
    name: string
  ) {
    this._baseCommand = baseCommand;
    this._group = group;
    this._name = name;
  }

  get baseCommand() {
    return this._baseCommand;
  }

  get group() {
    return this._group;
  }

  get name() {
    return this._name;
  }
}
