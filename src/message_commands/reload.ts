import { Message } from "discord.js";
import ExtendedClient from "../utils/Client";

exports.run = (message: Message, args: string[], client: ExtendedClient) => {
  let command: string | undefined;

  if (client.messageCommands?.has(args[0])) command = args[0];
  else if (client.aliases?.has(args[0])) command = client.aliases.get(args[0]);

  if (!command) return message.reply(`I cannot find the command: ${args[0]}`);

  message.reply(`Reloading: ${command}`).then((msg) => {
    client
      .reload(command!)
      .then(() => msg.edit(`Successfully reloaded: ${command!}`))
      .catch((err: any) =>
        message.edit(`Command reload failed: ${command}\n\`\`\`${err.stack}\`\`\``)
      );
  });
};

exports.conf = {
  aliases: ["r", "R"],
  permLevel: 4,
};

exports.help = {
  name: "reload",
  description: "Reloads the command file, if it's been updated or modified.",
  usage: "reload <commandname>",
};
