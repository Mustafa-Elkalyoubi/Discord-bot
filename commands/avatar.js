exports.run = async (client, message) => {
  let msg = "",
    pic;
  if (!message.mentions.users.first()) {
    pic = message.author.displayAvatarURL();
    message.channel.send(`**USER:** ${message.author} || **URL:** ${pic}`);
    return;
  }

  message.mentions.users.map((c) => {
    pic = c.displayAvatarURL();
    msg += `**USER:** ${c} || **URL:** ${pic}\n`;
  });

  message.channel.send(msg);
};

exports.conf = {
  aliases: ["pfp"],
  permLevel: 0,
};

exports.help = {
  name: "avatar",
  description: "Shows a user's avatar",
  usage: "avatar *mention*",
};
