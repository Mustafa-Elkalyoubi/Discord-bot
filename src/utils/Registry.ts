import { DateTime } from "luxon";
import ExtendedClient from "./Client.js";
import Modifiers from "./ConsoleText.js";

import Commands from "../commands/index.js";
import ContextCommands from "../contextCommands/index.js";
import SubCommands from "../subCommands/index.js";

const log = (message: string) => {
  console.log(
    `${Modifiers.GREEN}[${DateTime.now().toFormat("yyyy-MM-DD HH:mm:ss")}]: ${
      Modifiers.DEFAULT
    }${message}`
  );
};

async function registerCommands(client: ExtendedClient) {
  Commands.forEach((Command) => {
    const cmd = new Command();
    client.commandManager.addCommand(cmd.name, cmd);
    log(`${Modifiers.GREEN}Registering command: ${Modifiers.DEFAULT}${cmd.name}`);
  });
}

async function registerSubCommands(client: ExtendedClient) {
  SubCommands.forEach((BaseSubCommand) => {
    const subCommand = new BaseSubCommand();
    log(`${Modifiers.GREEN}Registering Subcommand: ${Modifiers.DEFAULT}${subCommand.name}`);
    client.commandManager.addSubcommand(subCommand.name, subCommand);
  });
}

async function registerContextCommands(client: ExtendedClient) {
  ContextCommands.forEach((ContextCommand) => {
    const cmd = new ContextCommand();

    client.commandManager.addContextcommand(cmd.name, cmd);
    log(`${Modifiers.GREEN}Registering context command: ${Modifiers.DEFAULT}${cmd.name}`);
  });
}

export { registerCommands, registerContextCommands, registerSubCommands };
