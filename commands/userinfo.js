const Discord = require("discord.js");
exports.run = async (client, message) => {
  let user = message.mentions.users.first();
  if (!user) user = message.author;
  let member = message.mentions.members.first();
  if (!member) member = message.member;
  let pic = user.displayAvatarURL();

  let randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);

  let embed = new Discord.MessageEmbed()
    .setAuthor(user.username, `${pic}`)
    .setThumbnail(pic)
    .setDescription("The user's info")
    .setColor(randomColor)
    .addField(`User`, `${user}`, true)
    .addField(`Nickname`, `${member.nickname}`, true)
    .addField("Username", `${user.username}#${user.discriminator}`, true)
    .addField("ID", `${user.id}`, true)
    .addField("Joined Server", `${member.joinedAt}`, true)
    .addField("Created at", `${user.createdAt}`, true);
  await message.channel.send({ embeds: [embed] });
};

exports.conf = {
  aliases: ["info", "user", "ui"],
  permLevel: 0,
};

exports.help = {
  name: "userinfo",
  description: "Sends a user's info",
  usage: "userinfo **user**",
};
