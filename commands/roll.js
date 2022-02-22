exports.run = async function run(client, message, args) {
  n = args[0];
  if (parseInt(n)) {
    roll = Math.floor(Math.random() * n) + 1;
    message.channel.send(roll.toString());
  } else message.channel.send(`${args[0]} is not a number retard`);
};

exports.conf = {
  aliases: [],
  permLevel: 0,
};

exports.help = {
  name: "roll",
  description: "roll a dice up to n",
  usage: "roll [n]",
};
