const Discord = require("discord.js");
exports.run = (client, message) => {
  let args = message.content.split(" ").slice(1).join(" ");
  if (args.includes("@here") || args.includes("@everyone"))
    return message.channel.send("look at this retard");
  message.channel.send(args);
  if (message.deletable) message.delete();
};

exports.conf = {
  aliases: ["Say"],
  permLevel: 0,
};

exports.help = {
  name: "say",
  description: "...says what you tell it to say",
  usage: "say **whatever**",
};
