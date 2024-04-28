import { Message } from "discord.js";
import ExtendedClient from "../utils/Client";
import { saveLastMessageID } from "../utils/FineHelper";

const run = async (message: Message, client: ExtendedClient) => {
  const msg = await message.channel.send("Rebooting...");

  await saveLastMessageID(client, {
    time: Date.now(),
    channelID: msg.channel.id,
    messageID: msg.id,
    shouldMessage: true,
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
