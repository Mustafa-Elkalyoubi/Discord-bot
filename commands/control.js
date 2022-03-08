exports.run = async (client, message, args) => {
  client.commandNames = require("../commandNames.json");

  let command;
  if (client.commands.has(args[0])) {
    command = args[0];
  } else if (client.aliases.has(args[0])) {
    command = client.aliases.get(args[0]);
  } else command = args[0];

  if (message.content.includes("enable")) {
    if (message.content.includes(`randoms`)) {
      client.last.enabled = 1;
      return message.channel.send(`Random messages has been enabled`);
    }

    if (command == "all") {
      for (var cmd in client.commandNames) {
        client.commandNames[cmd].enabled = true;
      }
      return message.reply(`All commands have been enabled`);
    }

    if (!client.commandNames[command])
      return message.reply("cannot find the command");
    if (client.commandNames[command].enabled === true)
      return message.reply(`command **${command}** is already enabled`);
    client.commandNames[command].enabled = true;
    message.reply(`command **${args[0]}** has been enabled`);
  }

  if (message.content.includes("disable")) {
    if (message.content.includes(`randoms`)) {
      client.last.enabled = 0;
      return message.channel.send(`Random messages has been disabled`);
    }

    neverDisable = ["reboot", "control", "eval", "test"];
    if (command == "all") {
      for (var cmd in client.commandNames) {
        if (!neverDisable.includes(cmd))
          client.commandNames[cmd].enabled = false;
      }
      return message.reply(`All commands have been disabled`);
    }

    if (!client.commandNames[command])
      return message.reply("cannot find the command");
    if (command === "control")
      return message.reply("dont try to be funny = ='");
    if (client.commandNames[command].enabled === false)
      return message.reply(`command **${command}** is already disabled`);
    client.commandNames[command].enabled = false;
    message.reply(`command **${command}** has been disabled`);
    return;
  }

  if (message.content.toLowerCase().includes("guildon")) {
    if (!client.commandNames[command])
      return message.reply("cannot find the command");
    if (client.commandNames[command].guildOnly === false)
      return message.reply(
        `command **${command}** is already available in dms`
      );
    client.commandNames[command].guildOnly = false;
    message.reply(`command **${command}** now available in dms`);
  }

  if (message.content.toLowerCase().includes("guildoff")) {
    if (!client.commandNames[command])
      return message.reply("cannot find the command");
    if (client.commandNames[command].guildOnly === true)
      return message.reply(
        `command **${command}** is already unavailable in dms`
      );
    client.commandNames[command].guildOnly = true;
    message.reply(`command **${command}** no longer available in dms`);
  }
};

exports.conf = {
  aliases: ["enable", "disable", "guildon", "guildoff", "guildOn", "guildOff"],
  permLevel: 4,
};

exports.help = {
  name: "control",
  description: "Sets a command to either be enabled or disabled",
  usage: "enable/disable *command name*",
};
