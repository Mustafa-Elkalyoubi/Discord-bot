import { Message } from "discord.js";
import ExtendedClient from "../utils/Client";

const run = async function run(message: Message, args: string[], client: ExtendedClient) {
  const onOrOff = client.toggleAI();

  message.reply(`text2img is now ${onOrOff ? "enabled" : "disabled"}`);
};

const conf = {
  aliases: ["toggleAI", "toggleai", "toggleAi", "toggle", "ai"],
  permLevel: 4,
};

const help = {
  name: "toggleAI",
  description: "Turns ai on/off",
  usage: "~toggleAi",
};

export default { run, conf, help };
