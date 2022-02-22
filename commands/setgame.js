exports.run = function (client, message, args) {
  if (message.author.id == "187507781392269313") {
    let args1 = message.content.split(" ").slice(1);
    var argresult = args1.join(" ");
    if (!argresult) argresult = null;
    client.user.setActivity(argresult);
  }
};

exports.conf = {
  aliases: [],
  permLevel: 4,
};

exports.help = {
  name: "setgame",
  description: "What game should the bot be playing?",
  usage: "setgame **anything/empty**",
};
