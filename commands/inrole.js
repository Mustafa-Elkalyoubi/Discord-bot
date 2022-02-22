const Discord = require("discord.js");
const moment = require("moment");
exports.run = async function run(client, message, args) {
  var n = 0;
  let role = message.mentions.roles.first();
  let length = args.length;

  if (role) {
    role = role.id;
  }

  if (!role) {
    for (var i = 0; i <= args.length; i++) {
      role = args[n];
      n++;
      if (!role) continue;
      break;
    }
    for (var i = n; i <= length - 1; i++) {
      role = role + " " + args[i];
    }
    if (!role)
      return message.reply("you must name or mention at least one role");
    let guildRolesLower = [];
    let guildRoles = [];
    let roleNum = 0;
    message.guild.roles.forEach((element) => {
      roleNum++;
      guildRoles.push(element.name);
      guildRolesLower.push(element.name.toLowerCase());
    });
    var j = 0;
    for (var i = 0; i <= guildRoles.length; i++) {
      if (guildRolesLower[i] == role.toLowerCase()) {
        roleNum = j;
        break;
      }
      j++;
    }
    role = guildRoles[j];
    role = message.guild.roles.find((x) => x.name === `${role}`);
    if (!role) return message.reply("I could not find that role");
    role = role.id;
  }

  if (!role) return message.reply("you must name or mention at least one role");

  var num = 0;
  let roleUsers = "";

  message.guild.members.forEach((element) => {
    if (element.roles.find((x) => x.id === `${role}`)) {
      num++;
      if (num == 1) {
        roleUsers = roleUsers + `${element}`;
      } else {
        roleUsers = roleUsers + `, ${element}`;
      }
    }
  });

  let pic = message.author.avatarURL;
  if (!pic) pic = message.author.defaultAvatarURL;
  let randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);

  var embed = new Discord.RichEmbed()
    .setAuthor(`${message.author.username}`, `${pic}`)
    .setColor(randomColor)
    .setDescription(`Number of users in role: **${num}**\n\n${roleUsers}`)
    .setFooter(`${moment().format("YYYY-MM-DD HH:mm:ss")} (GMT+4)`);
  message.channel.send({ embed });
};

exports.conf = {
  aliases: [],
  permLevel: 0,
};

exports.help = {
  name: "inrole",
  description: "Checks all users inside a specific role",
  usage: "~inrole *name*/*mention*",
};
