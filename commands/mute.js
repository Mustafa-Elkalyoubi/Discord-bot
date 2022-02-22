const Discord = require("discord.js");
const fs = require("fs");
exports.run = async (client, message, args) => {
  let toMute = message.mentions.members.first();
  console.log(toMute);
  if (!toMute) return await message.reply("who?");
  if (toMute.id === message.author.id)
    return await message.reply(`you cant mute yourself`);
  if (toMute.roles.highest.position >= message.member.roles.highest.position)
    return await message.reply(
      "you can't mute someone higher or has the same role as you"
    );
  let role = message.guild.roles.cache.find((x) => x.name === "Muted");
  let memberNumber = message.guild.members.cache.get(client.user.id).roles
    .highest.position;
  let roleNumber = memberNumber + 1;
  let time = parseInt(args[1]);
  let timeToMute = Date.now() + time * 1000;
  let msg = `${toMute.user} has been muted for ${time} seconds, feel free to insult 'em`;
  if (!time) {
    msg = `${toMute.user} has been muted`;
    timeToMute = 0;
  }
  /* 
      if(!role) try {
        role = await message.guild.createRole({
          name: "Muted",
          color: "#060606",
          hoist: false,
          mentionable: true,
          permissions: [],
        });
        message.guild.channels.cache.each(async (channel) => {
          await channel.overwritePermissions(role, {
            deny: ["SEND_MESSAGES"],
            deny: ["ADD_REACTIONS"],
            deny: ["ATTACH_FILES"]
          });
        });
      } catch(e) {
        console.log(e.stack);
        message.channel.send(`\`\`\`${e.stack}\`\`\``)
      }

      message.guild.channels.cache.each(async (channel) => {
        await channel.overwritePermissions(role, {
          deny: ["SEND_MESSAGES"],
          deny: ["ADD_REACTIONS"],
          deny: ["ATTACH_FILES"]
        });
      });
      
      role.setPosition(roleNumber)
      */

  if (toMute.roles.cache.has(role.id))
    return await message.channel
      .send(`${toMute.user} is already muted`)
      .then(message.channel.stopTyping());

  client.mutes[toMute.id] = {
    guild: message.guild.id,
    time: timeToMute,
    channel: message.channel.id,
    member: toMute,
  };

  await toMute.roles.add(role);

  fs.writeFile("./mutes.json", JSON.stringify(client.mutes, null, 4), (err) => {
    if (err) throw err;
    message.channel.send(msg);
  });

  let randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);
};

exports.conf = {
  aliases: [],
  permLevel: 2,
};

exports.help = {
  name: "mute",
  description: "Mutes a user",
  usage: "mute **user**",
};
