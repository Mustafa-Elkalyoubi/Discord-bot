const Discord = require("discord.js");
exports.run = async (client, message, args) => {
  let link = "https://cdn.discordapp.com/emojis/";
  let emote = args[0];
  let skip = false;
  message.channel.messages
    .fetch({ limit: 10 })
    .then(async (messages) => {
      let allMsg = messages.filter((m) => m.content.includes(emote));
      allMsg.forEach((msg) => {
        if (skip) return;
        emoteFound = msg.content
          .split(/[<>]+/)
          .find((element) => element.includes(emote) && element.includes(":"));
        if (emoteFound != undefined) {
          emoteID = emoteFound.split(":")[2];
          if (emoteID) {
            newLink =
              link +
              emoteID +
              `.${
                emoteFound[0] == "a" && emoteFound[1] == ":" ? "gif" : "png"
              }?v=1`;
            message.guild.emojis
              .create(newLink, emote)
              .then(async (emoji) => {
                await message.channel.send(
                  `<${emoji.animated ? `a` : ``}:${emoji.name}:${emoji.id}>`
                );
                skip = true;
              })
              .catch((error) => {
                message.channel.send(`\`\`\`${error.message}\`\`\``);
                console.error(error);
              });
          }
        }
      });
    })
    .catch((error) => {
      message.channel.send(`\`\`\`${error.message}\`\`\``);
      console.error(error);
    });
};

exports.conf = {
  aliases: ["steal"],
  permLevel: 0,
};

exports.help = {
  name: "emoteSteal",
  description: "steals an emote lol",
  usage: "~steal [emote name]",
};
