import { Message } from "discord.js";
import path from "node:path";
import fs from "node:fs";

exports.run = async (message: Message) => {
  const msg = await message.channel.send("Rebooting...");

  const miscPath = path.join(__dirname, "..", "data", "misc.json");
  const misc = JSON.parse(fs.readFileSync(miscPath, "utf-8").toString());

  misc.reboot = {
    time: Date.now(),
    channelID: msg.channel.id,
    messageID: msg.id,
    shouldMessage: true,
  };

  fs.writeFileSync(miscPath, JSON.stringify(misc, null, 4));

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
