const Discord = require("discord.js");
exports.run = async (client, message) => {
  let toMute = message.mentions.members.first();
  if (!toMute) return message.reply("who?");
  let role = message.guild.roles.cache.find((x) => x.name === "Muted");
  if (!role) message.reply("Muted role not found");

  let randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);

  if (!toMute.roles.cache.has(role.id))
    return message.channel.send(`${toMute.user} can already speak`);
  await toMute.roles.remove(role);
  message.channel.send(`${toMute.user} has been unmuted.`);
  delete client.mutes[toMute.id];
};

exports.conf = {
  aliases: [],
  permLevel: 2,
};

exports.help = {
  name: "unmute",
  description: "Unmutes a user",
  usage: "unmute **user**",
};
