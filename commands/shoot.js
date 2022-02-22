const Discord = require('discord.js');
exports.run = async (client, message, args) => {
    let shot = message.mentions.users.first();
    if(!shot) return message.channel.send(`${message.author} you tryna kys or somethin?`);

    let randomColor = '0x'+(Math.random()*0xFFFFFF<<0).toString(16);

    let shots = [
        `https://media0.giphy.com/media/oyr3pswQ8B2Sc/giphy.gif`,
        `http://i.imgur.com/SoruJKU.gif`,
        `https://media1.tenor.com/images/e9c914be61acb8f2033f2327605c5562/tenor.gif`,
        `http://media.giphy.com/media/ZAof6kl4SH2Ok/giphy.gif`,
        `https://78.media.tumblr.com/f1462c17a35c98d6110c2dd6f8c5fa7d/tumblr_myixjvTxhL1soa130o1_500.gif`,
        `https://i.pinimg.com/originals/d4/68/c4/d468c4834623aa728e873be7efa325ac.gif`,
        `http://www.laughspark.info/uploadfiles/funny-shooting-fail-girl-shoot-4392.gif`
    ];

    var embed = new Discord.MessageEmbed()
    .setColor(randomColor)
    .setTimestamp()
    .setImage(shots[Math.floor(Math.random() * shots.length)])
    .setDescription(`${message.author.username} just shot ${shot.username}`);
    await message.channel.send({embed});

};

exports.conf = {
  aliases: [],
  permLevel: 0
};


exports.help = {
  name: "shoot",
  description: "shoots someone :D",
  usage: "shoot *mention*"
};