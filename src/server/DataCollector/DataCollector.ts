import { EventEmitter } from "node:events";
import Modifiers from "../bot/utils/ConsoleText";
import { DateTime } from "luxon";

type DataCollectorEvents = {
  messageCommandAdded: (cmd: string) => unknown;
  commandAdded: (cmd: string) => unknown;
};

interface SubCommandCollector {
  baseName: string;
  subcommands: (string | { groupName: string; groupCommands: string[] })[];
}

class DataCollector extends (EventEmitter as new () => TypedEventEmitter<DataCollectorEvents>) {
  messageCommands: string[] = [];
  commands: string[] = [];
  subCommands: SubCommandCollector[] = [];
  contextCommands: string[] = [];

  constructor() {
    super();
  }

  log(message: string) {
    console.log(`[${DateTime.now().toFormat("F")}] ${message}`);
  }

  loadMessageCommand(cmd: MessageCommand) {
    this.messageCommands.push(cmd.help.name);
    this.log(
      `${Modifiers.GREEN}Message Command Added (${this.messageCommands.length}): ${Modifiers.DEFAULT}${cmd.help.name}`
    );
    this.emit("messageCommandAdded", cmd.help.name);
  }

  loadCommand(cmd: Command) {
    this.commands.push(cmd.name);
  }

  loadSubcommand(cmd: BaseSubCommand) {
    console.log(cmd.name);
  }

  loadContextCommand(cmd: ContextCommand) {
    console.log(cmd);
  }
}

export default DataCollector;
