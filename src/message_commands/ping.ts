import { Message } from "discord.js";
import ping from "ping";

exports.run = async (message: Message, args: string[]) => {
  message.channel.sendTyping();
  const world = parseInt(args[0].replace("w", "")) - 300;
  const url = `oldschool${world}.runescape.com`;
  const amount = args[1] ?? 3;
  ping.promise.probe(url, { extra: ["-n", amount] }).then((res) => {
    const max = Math.max(...res.times);
    message.reply(`w${world + 300} ping: **${max}ms**`);
  });
};

exports.conf = {
  aliases: ["p"],
  permLevel: 4,
};

exports.help = {
  name: "ping",
  description: "Ping an osrs world",
  usage: "~ping [world number]",
};
