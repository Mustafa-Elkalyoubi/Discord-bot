import config from "../config.json";
import { Message } from "discord.js";
import { codeBlock } from "discord.js";

exports.run = async (message: Message, args: String[]) => {
  if (message.author.id !== config.ownerID) return;

  const clean = (text: string) => {
    if (typeof text === "string")
      return text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
  };

  try {
    const code = args.join(" ");
    let evaled = eval(code);

    if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
    await message.channel.send(codeBlock("xl", clean(evaled)));
  } catch (err: any) {
    await message.channel.send({ content: "`ERROR`\n" + codeBlock("xl", clean(err)) });
  }
};

exports.conf = {
  aliases: ["e"],
  permLevel: 4,
};

exports.help = {
  name: "eval",
  description: "Evaluates any string as javascript code, then executes it",
  usage: "eval **command**",
};
