import { Snowflake } from "discord.js";

export class BaseCommand {
  private _name: string;
  private _all: boolean;

  constructor(name: string, server = true) {
    this._name = name;
    this._all = server;
  }

  get name() {
    return this._name;
  }

  get all() {
    return this._all;
  }
}
