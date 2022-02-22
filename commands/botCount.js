const Discord = require("discord.js");
exports.run = async (client, message) => {
  let botCount = message.guild.members;
  let botGroup = [];
  botCount.forEach(function (element) {
    let group = element.user;
    if (group.bot === true) botGroup.push(group);
  });

  let randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);
  let pic = message.author.avatarURL;
  if (!pic) pic = message.author.defaultAvatarURL;

  const embed = new Discord.RichEmbed()
    .setAuthor(`${message.author.username}`, `${pic}`)
    .setColor(randomColor)
    .setTimestamp()
    .setDescription(
      `\n**Bot Count:** __**${botGroup.length}**__\n\n**Bots: ${botGroup.join(
        ", "
      )}**`
    );
  await message.channel.send({ embed });
};

exports.conf = {
  aliases: ["botcount", "bc"],
  permLevel: 0,
};

exports.help = {
  name: "botCount",
  description: "Amount of Bots in the Server",
  usage: "botcount",
};
