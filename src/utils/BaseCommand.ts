export class BaseCommand {
  private _name: string;
  private _all: boolean;

  constructor(name: string, dev = false) {
    this._name = name;
    this._all = !dev;
  }

  get name() {
    return this._name;
  }

  get all() {
    return this._all;
  }
}
