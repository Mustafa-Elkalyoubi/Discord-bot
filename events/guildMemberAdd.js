const Discord = require("discord.js");
module.exports = (member) => {
  let guild = member.guild;
  let botRole = guild.roles.find((x) => x.name === "Bots");
  if (!botRole)
    botRole = guild.roles.find((x) => x.id === "386041242288652288");
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

  if (member.user.bot)
    helloChannel.send(
      `A new Bot **${member.user}** has joined __**${member.guild.name}**__`
    );
  if (member.user.bot) return member.addRole(botRole);

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  var random = getRandomInt(-1, 6).toString();

  if (random === "0") {
    helloChannel.send(
      `Whalecum ${member.user} to __**${member.guild.name}**__! YOU THOUGHT THIS WAS A WELCOME PIC BUT`,
      { file: "./those/dio.jpg" }
    );
  } else
    helloChannel.send(
      `Welcome, ${member.user} to __**${member.guild.name}**__! **Total Member Count: __${guild.members.size}__**`
    );
};
