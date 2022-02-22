const settings = require("../settings.json");
exports.run = async (client, message, args, perms) => {
  let cmd;
  let comds = [];
  let levelright = [];
  let conds = client.commands;
  let enables = client.commandNames;

  conds.forEach(function (element) {
    if (
      perms >= element.conf.permLevel &&
      enables[element.help.name]["enabled"]
    )
      levelright.push(element);
  });

  comds.push(client.commands.permLevel);
  if (!args[0]) {
    let commandNames = Array.from(client.commands.keys());
    let longest = commandNames.reduce(
      (long, str) => Math.max(long, str.length),
      0
    );
    if (
      `= Command List =\n\n[Use ${
        settings.prefix
      }help <commandname> for details]\n\n${levelright
        .map(
          (c) =>
            `${settings.prefix}${c.help.name}${" ".repeat(
              longest - c.help.name.length
            )} ::  ${c.help.description}`
        )
        .join("\n")}\nYour Permission Level: **${perms}**`.length < 2000
    ) {
      message.author.send(
        `= Command List =\n\n[Use ${
          settings.prefix
        }help <commandname> for details]\n\n${levelright
          .map(
            (c) =>
              `${settings.prefix}${c.help.name}${" ".repeat(
                longest - c.help.name.length
              )} ::  ${c.help.description}`
          )
          .join("\n")}\nYour Permission Level: **${perms}**`,
        { code: "asciidoc" }
      );
    } else {
      let levelright1 = levelright.slice(0, levelright.length / 2);
      let levelright2 = levelright.slice(
        levelright.length / 2,
        levelright.length
      );
      message.author.send(
        `= Command List =\n\n[Use ${
          settings.prefix
        }help <commandname> for details]\n\n${levelright1
          .map(
            (c) =>
              `${settings.prefix}${c.help.name}${" ".repeat(
                longest - c.help.name.length
              )} ::  ${c.help.description}`
          )
          .join("\n")}`,
        { code: "asciidoc" }
      );
      message.author.send(
        `${levelright2
          .map(
            (c) =>
              `${settings.prefix}${c.help.name}${" ".repeat(
                longest - c.help.name.length
              )} ::  ${c.help.description}`
          )
          .join("\n")}\nYour Permission Level: **${perms}**`,
        { code: "asciidoc" }
      );
    }
  } else {
    let command = args[0];
    if (client.commands.has(command)) {
      cmd = client.commands.get(command);
    } else if (client.aliases.has(command)) {
      cmd = client.commands.get(client.aliases.get(command));
    }
    if (cmd) {
      if (perms < cmd.conf.permLevel)
        return message.reply("you can't use that anyways, so no");
    }
    command = client.commands.get(command);
    if (!command) command = cmd;
    message.author.send(
      `= ${command.help.name} = \n${command.help.description}\nusage:: ${
        command.help.usage
      }\nAliases:: ${command.conf.aliases.join(", ")}`,
      { code: "asciidoc" }
    );
  }
  message.channel.send("Help sent");
  console.log(`Permission Level: ${perms}`);
};

exports.conf = {
  aliases: ["h", "halp"],
  permLevel: 0,
};

exports.help = {
  name: "help",
  description: "All Commands",
  usage: "help **command**",
};
