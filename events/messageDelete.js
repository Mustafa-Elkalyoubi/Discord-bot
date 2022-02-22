const Discord = require("discord.js");
const moment = require("moment");
module.exports = (message) => {
  if (!message.guild)
    return console.log(
      `\"${message.cleanContent}\" message by \"${
        message.author.username
      }\" has been deleted in the DMs @[${moment().format("HH:mm:ss")}]`
    );
  console.log(
    `\"${message.cleanContent}\" message by \"${
      message.author.username
    }\" has been deleted from \"${message.channel.name}\" in \"${
      message.channel.guild.name
    }\" @[${moment().format("HH:mm:ss")}]`
  );
};
