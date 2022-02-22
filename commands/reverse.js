exports.run = function run(client, message, args) {
  args = args.join(" ").split("");
  var i;
  let msg = "";
  for (i = args.length - 1; i >= 0; i--) {
    msg += args[i];
  }
  message.channel.send(msg);
};

exports.conf = {
  aliases: [],
  permLevel: 0,
};

exports.help = {
  name: "reverse",
  description: "reverses dat shit",
  usage: "reverse *msg*",
};
