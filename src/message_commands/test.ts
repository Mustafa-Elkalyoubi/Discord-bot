import { Message } from "discord.js";

exports.run = async (message: Message, args: string[]) => {
  console.log("we testing");
  console.log(message, args);
};

exports.conf = {
  aliases: ["t"],
  permLevel: 4,
};

exports.help = {
  name: "test",
  description: "testing lol",
  usage: "ya ok",
};
