import { Message } from "discord.js";
import ping from "ping";

const PingCommand: MessageCommand = {
  conf: {
    aliases: ["p"],
    permLevel: 4,
  },

  help: {
    name: "ping",
    description: "Ping an osrs world",
    usage: "~ping [world number]",
  },

  run: async (message: Message, args: string[]) => {
    if (message.channel.isSendable()) message.channel.sendTyping();

    const world = parseInt(args[0].replace("w", "")) - 300;
    const url = `oldschool${world}.runescape.com`;
    const amount = args[1] ?? 3;
    ping.promise.probe(url, { extra: ["-n", amount] }).then((res) => {
      const max = Math.max(...res.times);
      message.reply(`w${world + 300} ping: **${max}ms**`);
    });
  },
};

export default PingCommand;
