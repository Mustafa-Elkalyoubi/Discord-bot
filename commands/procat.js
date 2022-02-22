// https://procatinator.com/?cat=151
exports.run = (client, message, args) => {
  message.channel.send(
    `https://procatinator.com/?cat=` + Math.floor(Math.random() * 151)
  );
};

exports.conf = {
  aliases: ["procatinator", "proc", "cat"],
  permLevel: 0,
};

exports.help = {
  name: "procat",
  description: "Procatinator :D",
  usage: "procat",
};
