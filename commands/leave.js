exports.run = async (client, message, args) => {
  let id1 = args.join(" ");
  guild1 = client.guilds.find((x) => x.id === id1);
  message.channel.send(`Leaving server with ID ${id1} (${guild1.name})`);
  client.guilds.get(guild1.id).leave();
  message.channel.send(`Left.`);
};

exports.conf = {
  aliases: [],
  permLevel: 4,
};

exports.help = {
  name: "leave",
  description: "leeeeeeeave",
  usage: "leave",
};
