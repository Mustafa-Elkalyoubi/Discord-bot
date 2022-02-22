const Discord = require("discord.js");
const moment = require("moment");
const fs = require("fs");
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
      fs.writeFile(
        "./afks.json",
        JSON.stringify(client.afks, null, 4),
        (err) => {
          if (err) throw err;
        }
      );
      var embed = new Discord.MessageEmbed()
        .setAuthor(
          `${message.author.username} is currently AFK ${
            description == "" ? "" : "with this message:"
          }`,
          `${pic}`
        )
        .setDescription(`${args.join(" ")}`)
        .setFooter(`AFK time: ${client.afks[message.author.id].time} (GMT+4)`);
      return message.channel.send("Your AFK status has been updated: ", {
        embed,
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
    fs.writeFile("./afks.json", JSON.stringify(client.afks, null, 4), (err) => {
      if (err) throw err;
    });
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

  var embed = new Discord.MessageEmbed()
    .setAuthor(
      `${message.author.username} is currently AFK ${
        description == "" ? "" : "with this message:"
      }`,
      `${pic}`
    )
    .setDescription(`${description}`)
    .setFooter(`AFK time: ${moment().format("YYYY-MM-DD HH:mm:ss")} (GMT+4)`);

  fs.writeFile("./afks.json", JSON.stringify(client.afks, null, 4), (err) => {
    if (err) throw err;
    message.channel.send(
      `You are now AFK, this is the message that will send with any mention: `,
      { embed }
    );
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
