const settings = require("../settings.json");
exports.run = async (client, message) => {
  const clean = (text) => {
    if (typeof text === "string")
      return text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));
    else return text;
  };

  const args = message.content.split(" ").slice(1);

  if (message.content.startsWith(settings.prefix + "eval")) {
    if (message.author.id !== settings.ownerid) return;
    try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

      await message.channel.send(clean(evaled), { code: "xl" });
    } catch (err) {
      await message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
  }
};

exports.conf = {
  aliases: ["e"],
  permLevel: 4,
};

exports.help = {
  name: "eval",
  description: "Evaluates any string as javascript code, and executes it",
  usage: "eval **command**",
};
