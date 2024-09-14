import { Message } from "discord.js";

const run = async (message: Message) => {
  return message.reply(
    "https://discord.com/oauth2/authorize?client_id=270256905367191553&permissions=8&scope=bot%20applications.commands"
  );
};

const conf = {
  aliases: ["inv"],
  permLevel: 4,
};

const help = {
  name: "invite",
  description: "Invite the bot",
  usage: "invite",
};

export default { run, conf, help };
