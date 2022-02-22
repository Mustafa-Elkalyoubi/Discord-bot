const { exec } = require("child_process");

exports.run = async (client, message) => {
  let timems;
  await message.channel.send("Pong?").then((msg) => {
    timems = msg.createdTimestamp - message.createdTimestamp;
    msg.delete();
    // msg.edit(`Ping is: \*\*${msg.createdTimestamp - message.createdTimestamp}ms\*\*`);
  });

  client.clean = (text) => {
    if (typeof text !== "string") text = inspect(text, { depth: 0 });
    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
      .replace(
        client.token,
        "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0"
      );
    return text;
  };

  message.channel.send(`\`\`\`js
PING TO DISCORD: ${timems}ms || MAY BE UNSTABLE\`\`\``);
};

exports.conf = {
  aliases: [],
  permLevel: 0,
};

exports.help = {
  name: "ping",
  description: "Ping/Pong command. I wonder what this does?",
  usage: "ping",
};
