const Discord = require("discord.js");
module.exports = (member) => {
  let guild = member.guild;
  console.log(`\"${member.user}\" has left \"${guild.name}\" server`);
  let helloChannel = member.guild.channels.find((x) => x.name === "general");
  if (!helloChannel)
    helloChannel = member.guild.channels.find(
      (x) => x.name === "announcements"
    );
  if (!helloChannel)
    helloChannel = member.guild.channels.find(
      (x) => x.name === "Announcements"
    );
  if (!helloChannel) return;

  let leaves = [
    "https://media.tenor.com/images/4e1e3eb6baea0e3cf826f359247c35a3/tenor.gif",
    "http://www.reactiongifs.com/wp-content/uploads/2013/11/bye.gif",
    "http://janegilmore.com/wp-content/uploads/2016/01/tumblr_m7w2mpGqws1qg39ewo1_500.gif",
    "https://media.tenor.com/images/c4c9737dd74be5ac65f6967ab5541409/tenor.gif",
    "https://i.giphy.com/media/102IaezcOtSfuw/giphy.webp",
    "https://media.giphy.com/media/SxiUGuieBPVzG/giphy.gif",
    "https://i.pinimg.com/originals/25/e8/cd/25e8cd6dfe659aa30739a5085171032d.gif",
    "https://m.popkey.co/102277/zJoND_f-maxage-0_s-200x150.gif",
  ];

  var randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);
  const embed = new Discord.RichEmbed()
    .setColor(randomColor)
    .setTimestamp()
    .setImage(leaves[Math.floor(Math.random() * leaves.length)])
    .setDescription(
      `**${member.user}** ( ${member.user.username}#${member.user.discriminator} ) has left ${guild.name}`
    );

  if (member.user.bot) return helloChannel.send({ embed });

  helloChannel.send({ embed });
};
