exports.run = async function run(client, message) {
  var ms = client.uptime;
  var minutes = parseInt((ms / (1000 * 60)) % 60).toFixed(0);
  var seconds = parseInt((ms / 1000) % 60).toFixed(0);
  var hours = parseInt((ms / (1000 * 60 * 60)) % 24).toFixed(0);
  var days = parseInt((ms / (24 * 60 * 60 * 1000)) % 30).toFixed(0);
  if (seconds == 1) seconds = seconds + " second";
  else seconds = seconds + " seconds";
  if (minutes == 1) minutes = minutes + " minute";
  else minutes = minutes + " minutes";
  if (hours == 1) hours = hours + " hour";
  else hours = hours + " hours";
  if (days == 1) days = days + " day";
  else days = days + " days";
  await message.channel.send(
    `Bot has been online for: ${days}, ${hours}, ${minutes}, ${seconds}, and ${
      ms % 1000
    } milliseconds`
  );
  message.channel.stopTyping();
};

exports.conf = {
  aliases: ["up"],
  permLevel: 0,
};

exports.help = {
  name: "uptime",
  description: "How long the bot has been online for",
  usage: "uptime",
};
