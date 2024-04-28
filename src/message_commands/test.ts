import { Message } from "discord.js";

const run = async (message: Message, args: string[]) => {
  console.log("we testing");
  console.log(message, args);
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
