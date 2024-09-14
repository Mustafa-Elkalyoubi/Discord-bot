import { Message } from "discord.js";
import Misc from "../models/Misc.js";

const run = async (message: Message) => {
  const msg = await message.channel.send("Rebooting...");

  let misc = await Misc.findOne();

  if (!misc)
    misc = new Misc({
      reboot: {
        time: Date.now(),
        channelID: msg.channel.id,
        messageID: msg.id,
        shouldMessage: true,
      },
      shouldUpdateItems: false,
    });

  process.exit(1);
};

const conf = {
  aliases: ["restart"],
  permLevel: 4,
};

const help = {
  name: "reboot",
  description: "Restarts bot and indicates the reboot time.",
  usage: "reboot",
};

export default { run, conf, help };
