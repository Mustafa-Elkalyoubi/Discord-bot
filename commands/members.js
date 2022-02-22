const Discord = require("discord.js");
exports.run = async (client, message) => {
  message.delete();
  let pic = message.author.avatarURL;
  if (!pic) pic = message.author.defaultAvatarURL;
  let randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);
  let people = message.guild.members;
  let peoplename = [];
  people.forEach(function (element) {
    if (element.user.bot) return;
    peoplename.push(element.user);
  });

  let peoplename2length = peoplename.join(" ").length / 2;
  if (peoplename.join('", "').length >= 2048) {
    if (
      message.channel.name.toLowerCase() !== "botspam" &&
      message.channel.name.toLowerCase() !== "bot-spam" &&
      message.channel.name.toLowerCase() !== "we"
    )
      return message.channel.send("Use this command in #botspam");
    var peoplename2 = peoplename.slice(0, peoplename.length / 2);
    var peoplename3 = peoplename.slice(
      peoplename.length / 2,
      peoplename.length
    );

    if (peoplename2.join('", "').length >= 2048) {
      var peoplename4 = peoplename2.slice(0, peoplename2.length / 2);
      var peoplename5 = peoplename2.slice(
        peoplename2.length / 2,
        peoplename2.length
      );
      var peoplename6 = peoplename3.slice(0, peoplename3.length / 2);
      var peoplename7 = peoplename3.slice(
        peoplename3.length / 2,
        peoplename3.length
      );

      var embed = new Discord.RichEmbed()
        .setAuthor(message.author.username, pic)
        .setColor(randomColor)
        .setDescription(`All Users: ${peoplename4.join(", ")}`);
      message.channel.send({ embed });

      var embed = new Discord.RichEmbed()
        .setColor(randomColor)
        .setDescription(`${peoplename5.join(", ")}`);
      message.channel.send({ embed });

      var embed = new Discord.RichEmbed()
        .setColor(randomColor)
        .setDescription(`${peoplename6.join(", ")}`);
      message.channel.send({ embed });

      var embed = new Discord.RichEmbed()
        .setColor(randomColor)
        .setDescription(
          `${peoplename7.join(", ")} \n\n **Total User Count: __${
            peoplename4.length +
            peoplename5.length +
            peoplename6.length +
            peoplename7.length
          }__**`
        );
      message.channel.send({ embed });
    } else {
      var embed = new Discord.RichEmbed()
        .setColor(randomColor)
        .setAuthor(message.author.username, pic)
        .setDescription(`All Users: ${peoplename2.join(", ")}`);
      message.channel.send({ embed });

      var embed = new Discord.RichEmbed()
        .setColor(randomColor)
        .setDescription(
          peoplename3.join(", ") +
            `\n\n **Total User Count: __${
              peoplename3.length + peoplename2.length
            }__**`
        );
      message.channel.send({ embed });
    }
  } else {
    var embed = new Discord.RichEmbed()
      .setColor(randomColor)
      .setAuthor(message.author.username, pic)
      .setDescription(
        `All Users: ${peoplename.join(", ")} \n\n **Total User Count: __${
          peoplename.length
        }__**`
      );
    message.channel.send({ embed });
  }
};

exports.conf = {
  aliases: ["m"],
  permLevel: 0,
};

exports.help = {
  name: "members",
  description: "A list of all members in the clan",
  usage: "members",
};
