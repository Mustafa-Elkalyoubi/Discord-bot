import { codeBlock } from "discord.js";

const EvalCommand: MessageCommand = {
  conf: {
    aliases: ["e"],
    permLevel: 4,
  },
  help: {
    name: "eval",
    description: "Evaluates any string as javascript code, then executes it",
    usage: "eval **command**",
  },

  run: async (message, args) => {
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
      // eslint-disable-next-line no-eval
      let evaled = (0, eval)(code);

      if (typeof evaled !== "string") evaled = (await import("util")).inspect(evaled);

      if (message.channel.isSendable()) await message.channel.send(codeBlock("xl", clean(evaled)));
    } catch (err) {
      if (typeof err === "string" && message.channel.isSendable())
        await message.channel.send({ content: "`ERROR`\n" + codeBlock("xl", clean(err)) });

      console.error(err);
    }
  },
};

export default EvalCommand;
