const Discord = require("discord.js");
exports.run = (client, message, args) => {
  let reason = args.slice(1).join(" ");
  let user = message.mentions.users.first();
  let modlog = message.guild.channels.find((x) => x.name === "mod-log");
  if (message.mentions.users.size < 1)
    return message.reply("Kick who??").catch(console.error);
  if (reason.length < 1) reason = "None Given";

  if (!message.member(user).kickable)
    return message.reply("Cant't kick that person");
  message.member(user).kick(reason);

  message.channel.send("lol see ya, " + user);
  const embed = new Discord.RichEmbed()
    .setAuthor(`${message.author.username}`, `${message.author.avatarURL}`)
    .setColor(0xff0000)
    .setTimestamp()
    .setDescription(
      `**Action:** Kick\n**Target:** ${user.tag}\n**Moderator:** ${message.author.tag}\n**Reason:** ${reason}`
    );
  return message.channel.send({ embed });
};

exports.conf = {
  aliases: [],
  permLevel: 3,
};

exports.help = {
  name: "kick",
  description: "Kicks the mentioned user.",
  usage: "kick **mention** **user**",
};
