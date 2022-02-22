const Discord = require("discord.js");
exports.run = async (client, message) => {
  if (message.guild == null)
    return message.reply("Does this looks like a server to you??");
  if (!message.guild.available) return message.reply("Guild is not available");
  let picture = message.guild.iconURL();
  let emojis = message.guild.emojis.cache.map((c) => ` ${c}`);
  if (!message.guild.iconURL) picture = message.guild.defaultIconURL;
  let embed = new Discord.MessageEmbed()
    .setTitle(`${message.guild.name} server info`)
    .setAuthor(
      `${message.author.username}`,
      `${message.author.displayAvatarURL()}`
    )
    .setColor(0x03ae42)
    .setImage(picture)
    .setTimestamp()
    .setURL(picture)
    .addField("Owner", `${message.guild.owner}`, true)
    .addField("Member Count", `${message.guild.memberCount}`, true)
    .addField("Roles", `${message.guild.roles.cache.map((c) => ` ${c}`)}`, true)
    .addField(
      "Channels",
      `${message.guild.channels.cache.map((c) => ` ${c}`)}`,
      true
    )
    // .addField("Emojis", `${emojis}`, true)
    .addField("Region", `${message.guild.region}`, true)
    .addField("Date Created", `${message.guild.createdAt}`, true);

  await message.channel.send({ embeds: [embed] });
};

exports.conf = {
  aliases: ["si", "server"],
  permLevel: 0,
};

exports.help = {
  name: "serverinfo",
  description: "Server's info",
  usage: "serverinfo",
};
