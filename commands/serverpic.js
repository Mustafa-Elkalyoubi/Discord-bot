const Discord = require("discord.js");
exports.run = (client, message) => {
  if (message.guild == null)
    return message.reply("Does this looks like a server to you??");
  if (!message.guild.available) return message.reply("Guild is not available");
  let picture = message.guild.iconURL;
  if (!picture) return message.channel.send("No image found");

  if (message.author.id === "246983710434525184") {
    message.channel.send(person.avatarURL);
    return;
  }

  let randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);

  var embed = new Discord.RichEmbed()
    .setTimestamp()
    .setColor(randomColor)
    .setAuthor(
      `Requested by ${message.author.username}`,
      `${message.author.avatarURL}`
    )
    .setTitle(`${message.guild.name} server icon`)
    .setURL(`${picture}`)
    .setImage(`${picture}`);
  message.channel.send({ embed });
};

exports.conf = {
  aliases: ["sp"],
  permLevel: 0,
};

exports.help = {
  name: "serverpic",
  description: "Server's pic",
  usage: "serverpic",
};
