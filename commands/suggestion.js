const settings = require("../settings.json");
exports.run = (client, message) => {
  let me = client.users.get(settings.ownerid);
  let args = message.content.split(" ").slice(1).join(" ");
  me.send(`${message.author.username} is suggesting: ${args}`);
};

exports.conf = {
  aliases: ["suggest"],
  permLevel: 0,
};

exports.help = {
  name: "suggestion",
  description: "Any suggestions?",
  usage: "suggest **message**",
};
