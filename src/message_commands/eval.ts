import { Message, codeBlock } from "discord.js";

const run = async (message: Message, args: string[]) => {
  const { OWNER_ID } = process.env;
  if (message.author.id !== OWNER_ID) return;

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

    if (typeof evaled !== "string") evaled = (await import("util")).inspect(evaled);
    await message.channel.send(codeBlock("xl", clean(evaled)));
  } catch (err) {
    if (typeof err === "string")
      await message.channel.send({ content: "`ERROR`\n" + codeBlock("xl", clean(err)) });
  }
};

const conf = {
  aliases: ["e"],
  permLevel: 4,
};

const help = {
  name: "eval",
  description: "Evaluates any string as javascript code, then executes it",
  usage: "eval **command**",
};

export default { run, conf, help };
