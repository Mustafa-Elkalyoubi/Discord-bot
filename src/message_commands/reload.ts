import { Message } from "discord.js";
import ExtendedClient from "../utils/Client.js";

const run = (message: Message, args: string[], client: ExtendedClient) => {
  const command = client.commandManager.getMessageCommand(args[0]);

  if (!command) return message.reply(`I cannot find the command: ${args[0]}`);

  message.reply(`Reloading: ${command}`).then((msg) => {
    client.commandManager
      .reload(command!)
      .then(() => msg.edit(`Successfully reloaded: ${command!}`))
      .catch((err: unknown) =>
        message.edit(`Command reload failed: ${command}\n\`\`\`${err}\`\`\``)
      );
  });
};

const conf = {
  aliases: ["r", "R"],
  permLevel: 4,
};

const help = {
  name: "reload",
  description: "Reloads the command file, if it's been updated or modified.",
  usage: "reload <commandname>",
};

export default { run, conf, help };
