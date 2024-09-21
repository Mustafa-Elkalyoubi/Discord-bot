import { DateTime } from "luxon";
import Commands from "../commands/commands.js";
import Subcommands from "../subCommands/subcommands.js";
import ExtendedClient from "./Client.js";
import Modifiers from "./ConsoleText.js";
import MessageCommands from "../message_commands/messageCommands.js";

const log = (message: string) => {
  console.log(
    `${Modifiers.GREEN}[${DateTime.now().toFormat("yyyy-MM-DD HH:mm:ss")}]: ${Modifiers.DEFAULT}${message}`
  );
};

async function registerCommands(client: ExtendedClient) {
  MessageCommands.forEach(async (command) => {
    client.commandManager.messageCommandManager.addMessageCommand(command);
  });

  Commands.forEach((Command) => {
    const cmd = new Command();

    client.commandManager.addCommand(cmd.name, cmd);
    log(`${Modifiers.GREEN}Registering command: ${Modifiers.DEFAULT}${cmd.name}`);
  });

  Subcommands.forEach((Subcommand) => {
    const cmd = new Subcommand();

    client.commandManager.addSubcommand(cmd.name, cmd);
    cmd.groups.forEach((group) => {
      group.subCommands.forEach((GroupSubcmd) => {
        const groupCMD = new GroupSubcmd(cmd.name, group.name);

        client.commandManager.addGroupcommand(group.name, groupCMD.name, groupCMD);
      });
    });
  });
}

export { registerCommands };
