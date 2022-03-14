const settings = require("../settings.json");
const moment = require("moment");
const talkedRecently = new Set();
const { MessageEmbed } = require("discord.js");

module.exports = (message) => {
  let client = message.client;
  let attachment = message.attachments;
  if (message.author.bot) {
    if (!message.guild) return;
    console.log(
      `${message.guild.name} @[${moment().format("HH:mm:ss")}] || BOT ${
        message.author.username
      }: ${message.content}`
    );
    return;
  } else {
    if (attachment.size > 0) {
      if (message.guild == null) {
        console.log(
          `DM @[${moment().format("HH:mm:ss")}] || ${
            message.author.username
          }: ${message.content} || File: (${attachment.map((c) => c.url)})`
        );
        client.channels
          .fetch(`782202960037675058`)
          .then((channel) =>
            channel.send(
              `${message.author.username} (${message.author.id}): ${
                message.content
              } || File: (${attachment.map((c) => c.url)})`
            )
          )
          .catch(console.error);
      } else {
        console.log(
          `${message.guild.name} @[${moment().format("HH:mm:ss")}] || ${
            message.author.username
          } : ${message.content} || File: (${attachment.map((c) => c.url)})`
        );
      }
    } else {
      if (message.guild == null) {
        console.log(
          `DM @[${moment().format("HH:mm:ss")}] || ` +
            message.author.username +
            ": " +
            message.content
        );
        client.channels
          .fetch(`782202960037675058`)
          .then((channel) =>
            channel.send(
              message.author.username +
                ` (${message.author.id}): ` +
                message.content
            )
          )
          .catch(console.error);
      } else {
        console.log(
          `${message.guild.name} @[${moment().format("HH:mm:ss")}] || ${
            message.author.username
          }: ${message.content}`
        );
      }
    }
  }

  if (message.mentions.users.first()) {
    if (client.afks[message.mentions.users.first().id]) {
      let sincems = client.afks[message.mentions.users.first().id].since;
      var embed = new MessageEmbed()
        .setAuthor({
          name: `${
            client.afks[message.mentions.users.first().id].name
          } is currently AFK ${
            client.afks[message.mentions.users.first().id].description == ""
              ? ""
              : "with this message:"
          }`,
          iconURL: `${client.afks[message.mentions.users.first().id].pic}`,
        })
        .setDescription(
          `${
            client.afks[message.mentions.users.first().id].description
          }\n\n<t:${Math.floor(sincems / 1000)}:R>`
        )
        .setTimestamp();

      client.afks[message.mentions.users.first().id].messages[
        client.afks[message.mentions.users.first().id].numMessage
      ] = `<t:${Math.floor(Date.now() / 1000)}:t> **${
        message.author.username
      }**: ${message.content}`;
      client.afks[message.mentions.users.first().id].numMessage += 1;

      message.channel.send({ embeds: [embed] });
    }
  }

  client.commandNames = require("../commandNames.json");
  if (!message.content.startsWith(settings.prefix)) return;
  let command = message.content
    .split(" ")[0]
    .slice(settings.prefix.length)
    .toLowerCase();
  let args = message.content.split(" ").slice(1);
  let perms = client.elevation(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    if (message.guild == null && cmd.conf.guildOnly == true)
      return message.reply("Try using this command in a server chat.");
    if (perms < cmd.conf.permLevel)
      return message.reply("you don't have the permissions to use that");
    if (client.commandNames[cmd.help.name].enabled === false && perms != 4)
      return message.reply("this command is disabled");
    if (
      client.commandNames[cmd.help.name].guildOnly === true &&
      message.guild == null
    )
      return message.reply(
        "This command is disabled in direct messages, try again in a server"
      );
    cmd.run(client, message, args, command, perms);

    if (talkedRecently.has(message.author.id)) return;
    talkedRecently.add(message.author.id);
    setTimeout(() => {
      talkedRecently.delete(message.author.id);
    }, 1500);
  }
};
