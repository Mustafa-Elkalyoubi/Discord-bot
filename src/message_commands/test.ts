import { Message } from "discord.js";

async function run(message: Message, args: string[]) {
  message.reply("Not doin anything lol");
}

const conf = {
  aliases: ["t"],
  permLevel: 4,
};

const help = {
  name: "test",
  description: "testing lol",
  usage: "ya ok",
};

export { run, conf, help };
