import { Message } from "discord.js";
import ExtendedClient from "../utils/Client.js";

const run = async (message: Message, args: string[], client: ExtendedClient) => {
  // console.log(client.commandManager.subCommands.get("reminder")?._groupCommands);
};

const conf = {
  aliases: ["t"],
  permLevel: 4,
};

const help = {
  name: "test",
  description: "testing lol",
  usage: "ya ok",
};

export default { run, conf, help };
