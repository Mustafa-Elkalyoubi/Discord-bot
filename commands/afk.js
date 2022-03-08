const { MessageEmbed } = require("discord.js");
const moment = require("moment");
exports.run = async (client, message, args) => {
  let randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);
  let description = args.join(" ");
  let pic = message.author.displayAvatarURL();
  let msgs = [];

  if (client.afks[message.author.id]) {
    var obj = client.afks;
    for (var i = 0; i < obj[message.author.id].numMessage; i++) {
      msgs.push(obj[message.author.id]["messages"][`${i}`]);
    }

    if (!args.join(" ") == "") {
      client.afks[message.author.id].description = args.join(" ");
      var embed = new MessageEmbed()
        .setAuthor({
          name: `${message.author.username} is currently AFK ${
            description == "" ? "" : "with this message:"
          }`,
          iconURL: `${message.author.displayAvatarURL()}`,
        })
        .setDescription(
          `${args.join(" ")}\n\n<t:${Math.floor(
            obj[message.author.id].since / 1000
          )}:R>`
        )
        .setTimestamp();
      return message.channel.send({
        content: "Your AFK status has been updated: ",
        embeds: [embed],
      });
    }

    if (obj[message.author.id]["numMessage"] == 0)
      message.channel.send(`Welcome back, ${message.author}`);
    else
      message.channel.send(
        `Welcome back, there ${
          obj[message.author.id]["numMessage"] > 1 ? "were" : "was"
        } ${obj[message.author.id]["numMessage"]} message${
          obj[message.author.id]["numMessage"] > 1 ? "s" : ""
        } that pinged you:\n======================================================\n${msgs
          .map((c) => c)
          .join("\n")}`
      );
    delete client.afks[message.author.id];
    return;
  }

  client.afks[message.author.id] = {
    name: message.author.username,
    time: moment().format("MM-DD HH:mm:ss"),
    since: Date.now(),
    description: description,
    pic: pic,
    numMessage: 0,
    messages: {},
  };

  var embed = new MessageEmbed()

    .setAuthor({
      name: `${message.author.username} is currently AFK ${
        description == "" ? "" : "with this message:"
      }`,
      iconURL: `${message.author.displayAvatarURL()}`,
    })
    .setDescription(`${description}\n\n<t:${Math.floor(Date.now() / 1000)}:R>`)
    .setTimestamp();
  message.channel.send({
    content: `You are now AFK, this is the message that will send with any mention: `,
    embeds: [embed],
  });
};

exports.conf = {
  aliases: [],
  permLevel: 0,
};

exports.help = {
  name: "afk",
  description: "If you wish to go afk for a while, use this command",
  usage: "afk *ign* *time*",
};
