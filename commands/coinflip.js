exports.run = async function run(client, message, args) {
  roll = Math.floor(Math.random() * 2);
  message.channel.send(`${roll == 0 ? "🪙 Heads" : "🪙 Tails"}`);
};

exports.conf = {
  aliases: ["flip"],
  permLevel: 0,
};

exports.help = {
  name: "coinflip",
  description: "if you dont know what a coinflip is you're actually retarded",
  usage: "coinflip",
};
