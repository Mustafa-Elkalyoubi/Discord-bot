/* eslint-disable @typescript-eslint/no-unused-vars */
import { Message } from "discord.js";
import ExtendedClient from "../utils/Client.js";

const run = async (message: Message, args: string[], client: ExtendedClient) => {
  // console.log(client.commandManager.subCommands.get("reminder")?._groupCommands);
  console.log("did it work");
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

const Test: MessageCommand = { run, conf, help };

export default Test;
