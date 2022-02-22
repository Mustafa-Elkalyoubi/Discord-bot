exports.run = async (client, message) => {
  await message.channel.send("Pong?").then((msg) => {
    msg.edit(
      `Ping is: \*\*${Math.round(
        (parseInt(client.pings[0]) +
          parseInt(client.pings[1]) +
          parseInt(client.pings[2])) /
          3
      )}ms\*\*`
    );
  });
};

exports.conf = {
  aliases: [],
  permLevel: 0,
};

exports.help = {
  name: "pings",
  description: "Ping/Pong command. I wonder what this does?",
  usage: "pings",
};
