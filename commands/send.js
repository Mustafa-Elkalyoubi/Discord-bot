exports.run = async function run(client, message, args) {
  let channelID = args[0];
  let msg = args.slice(1).join(" ");
  try {
    return (channel = client.channels.cache.get(`${channelID}`).send(msg));
  } catch (e) {
    console.log("Couldnt send to channel");
  }
  let userID = args[0];
  try {
    await client.users.fetch(userID).then(function (user) {
      user.send(msg);
      return console.log(`DM Sent to ${user.username}: ${msg}`);
    });
  } catch (e) {
    console.log(e.stack);
  }
};

exports.conf = {
  aliases: [],
  permLevel: 4,
};

exports.help = {
  name: "send",
  description: "secret send thing lol",
  usage: "~send [channel ID] [message]",
};
