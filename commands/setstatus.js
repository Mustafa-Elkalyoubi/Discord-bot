exports.run = function (client, message, args) {
  let args1 = message.content.split(" ").slice(1).join(" ");
  if (message.author.id == "187507781392269313") {
    if (!args1) args1 = "online";
    client.user.setActivity(args1);
  }
};

exports.conf = {
  aliases: ["setstream"],
  permLevel: 4,
};

exports.help = {
  name: "setstatus",
  description: "Sets the status of the bot",
  usage: "setstatus **online/idle/dnd/invisible***",
};
