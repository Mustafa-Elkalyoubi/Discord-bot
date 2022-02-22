const Discord = require("discord.js");
const fs = require("fs");

let pinEmote = "📌";

module.exports = (messageReaction, user) => {
  let client = messageReaction.client;
  let pinChannelID = "850374192397942805";
  let pinChannel = client.channels.cache.get(`${pinChannelID}`);

  if (messageReaction.emoji.name == pinEmote) {
    let message = messageReaction.message;
    pinChannel.messages
      .fetch(client.pins[message.id]["messageID"])
      .then((pinnedMessage) => {
        let newEmbed = embedBuild(messageReaction, user);
        if (messageReaction.count == 0) {
          delete client.pins[message.id];
          fs.writeFileSync(
            "./pins.json",
            JSON.stringify(client.pins, null, 4),
            (err) => {
              if (err) throw err;
            }
          );
          return pinnedMessage.delete();
        }
        return pinnedMessage.edit(newEmbed);
      });
  }
};

function embedBuild(messageReaction, user) {
  let pic = messageReaction.message.author.displayAvatarURL();
  let randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);
  let message = messageReaction.message;
  let messageLink = `https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`;
  let embed = new Discord.MessageEmbed()
    .setAuthor(messageReaction.message.author.username, `${pic}`)
    .setDescription(`${messageReaction.message.content}`)
    .setColor(randomColor)
    .addField(
      `**${messageReaction.count}** ${pinEmote}`,
      `[Message Link](${messageLink})`,
      true
    )
    .setTimestamp()
    .setFooter(`In ${message.channel.name}`);
  if (message.embeds[0] || message.attachments.first())
    embed.setImage(
      message.embeds[0]
        ? message.embeds[0].url
        : message.attachments.first().url
    );
  return embed;
}
