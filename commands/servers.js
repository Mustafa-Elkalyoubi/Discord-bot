exports.run = async function run(client, message, args) {
  let msg = "";
  let n = 0;
  client.guilds.forEach((element) => {
    msg = msg + `**${element.name}**: \`${element.id}\`\n`;
    n++;
  });
  message.channel.send(`Servers (**${n}**):\n` + msg);
};

exports.conf = {
  aliases: [],
  permLevel: 4,
};

exports.help = {
  name: "servers",
  description: "lists all servers",
  usage: "servers",
};
