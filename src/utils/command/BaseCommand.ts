export class BaseCommand {
  private _name: string;
  private _private: boolean;

  constructor(name: string, dev = false) {
    this._name = name;
    this._private = !dev;
  }

  get name() {
    return this._name;
  }

  get private() {
    return this._private;
  }
}
