const Discord = require('discord.js');
exports.run = async (client, message, args) => {
    let slapped = message.mentions.users.first();
    if(!slapped) return message.channel.send(`${message.author} just slapped.. the air?`);

    let randomColor = '0x'+(Math.random()*0xFFFFFF<<0).toString(16);

    let slaps = [
        `https://camo.derpicdn.net/c5a95b4a8d873e9d7443c4a8120d26bb81c02280?url=http%3A%2F%2Fi41.tinypic.com%2Frvjyv9.gif`,
        `https://cdn.discordapp.com/attachments/395582748032761866/399307079761788957/giphy.gif`,
        `https://cdn.discordapp.com/attachments/395582748032761866/399307134384472064/tenor.gif`,
        `https://cdn.discordapp.com/attachments/395582748032761866/399307233575567360/NKV28-.gif`,
        `https://cdn.discordapp.com/attachments/395582748032761866/399307436714098699/bmfxffY.gif`,
        `https://cdn.discordapp.com/attachments/395582748032761866/399307791153496064/giphy_2.gif`,
        `https://cdn.discordapp.com/attachments/395582748032761866/399308770808954880/jhRVROG.gif`,
        `https://shirokuns.com/wp-content/uploads/2017/08/butt-slapping.gif`
    ];
    
    if(message.author.id === slapped.id) {
        var embed = new Discord.MessageEmbed()
        .setColor(randomColor)
        .setTimestamp()
        .setImage(`https://cdn.discordapp.com/attachments/395582748032761866/399310606253162498/PichuBroButSlap.gif`)
        .setDescription(`${message.author.username} is slapping their own butt | kinky `);
        await message.channel.send({embed});
        return;
    }

    var embed = new Discord.RichEmbed()
    .setColor(randomColor)
    .setTimestamp()
    .setImage(slaps[Math.floor(Math.random() * slaps.length)])
    .setDescription(`${message.author.username} slapped ${slapped.username}'s butt | *kinky*`);
    await message.channel.send({embed});

};

exports.conf = {
  aliases: ['butt slap', 'slap butt'],
  permLevel: 0
};


exports.help = {
  name: "slap",
  description: "slaps someone :D",
  usage: "slap *mention*"
};