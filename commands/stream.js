const Discord = require("discord.js");
exports.run = (client, message) => {
  let args = message.content.split(" ").slice(1).join(" ");
  if (!args) args = "What are you lookin at?";
  client.user.setActivity(`${args}`, {
    url: "https://www.twitch.tv/NothingHere",
    type: 1,
  });
};

exports.conf = {
  aliases: ["streaming"],
  permLevel: 4,
};

exports.help = {
  name: "stream",
  description: "Only for mr cookie",
  usage: "stream *args*",
};
