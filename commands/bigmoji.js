exports.run = (client, message, args) => {
  var i;
  let msg = "";
  for (i = 0; i < args.length; i++) {
    var emojiLength = args[i].length;
    msg =
      msg +
      `**Name:** ${args[i].slice(
        1,
        emojiLength - 19
      )} || **URL:** https://cdn.discordapp.com/emojis/${args[i].slice(
        emojiLength - 19,
        emojiLength - 1
      )}.png \n`;
  }
  message.channel.send(msg);
};

exports.conf = {
  aliases: ["jumbo", "bm"],
  permLevel: 0,
};

exports.help = {
  name: "bigmoji",
  description: "a big emoji",
  usage: "bigmoji *emoji*",
};
