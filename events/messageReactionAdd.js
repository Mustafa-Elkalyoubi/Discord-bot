const Discord = require("discord.js");

let pinEmote = "📌";

module.exports = (messageReaction, user) => {
  let message = messageReaction.message;
  let client = messageReaction.client;
  let pinChannelID = "850374192397942805";
  let pinChannel = client.channels.cache.get(`${pinChannelID}`);

  console.log(message);

  let iWantAsync = async function () {
    if (
      messageReaction.emoji.name == pinEmote &&
      messageReaction.message.channel.id != pinChannelID
    ) {
      if (isAlreadyPinned(messageReaction, client)) {
        await pinChannel.messages
          .fetch(client.pins[message.id]["messageID"])
          .then((pinnedMessage) => {
            let newEmbed = embedBuild(messageReaction, user);
            return pinnedMessage.edit(newEmbed);
          });
      } else {
        embedNew(messageReaction, user, pinChannel, client);
      }
    }
  };

  iWantAsync();
};

async function embedNew(messageReaction, user, pinChannel, client) {
  let embed = embedBuild(messageReaction, user);
  let pinMessage = await pinChannel.send({ embed });
  let message = messageReaction.message;
  client.pins[message.id] = {
    channelID: pinMessage.channel.id,
    messageID: pinMessage.id,
  };
}

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

function isAlreadyPinned(messageReaction, client) {
  if (client.pins[messageReaction.message.id]) return true;
}
