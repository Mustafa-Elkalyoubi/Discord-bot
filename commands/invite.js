exports.run = (client, message) => {
  message.channel.send(
    `pls invite me :>\nhttps://discordapp.com/oauth2/authorize?client_id=270256905367191553&scope=bot&permissions=8`
  );
};

exports.conf = {
  aliases: ["inv"],
  permLevel: 0,
};

exports.help = {
  name: "invite",
  description: "Invite link :D",
  usage: "invite",
};
