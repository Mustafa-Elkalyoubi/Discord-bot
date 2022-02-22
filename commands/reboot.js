const fs = require("fs");
exports.run = async (client, message, args) => {
  var today = new Date();
  var date =
    today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  await message.channel.send("Rebooting...");

  client.lastReboot = {
    date: date,
    time: time,
    channel: message.channel.id,
    reboot: true,
  };

  fs.writeFileSync(
    "./reboot.json",
    JSON.stringify(client.lastReboot),
    (err) => {
      if (err) throw err;
    }
  );

  process.exit(1);
};

exports.conf = {
  aliases: ["restart"],
  permLevel: 4,
};

exports.help = {
  name: "reboot",
  description: "Restarts bot and indicates the reboot time.",
  usage: "reboot",
};
