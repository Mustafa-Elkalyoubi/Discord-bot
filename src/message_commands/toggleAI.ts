import { ActivityType, Message } from "discord.js";
import ExtendedClient from "../utils/Client";

exports.run = async function run(message: Message, args: string[], client: ExtendedClient) {
  client.aiEnabled = !client.aiEnabled;
  client.user?.setActivity(
    client.aiEnabled ? "Text2Img is enabled :)" : "Text2Img is disabled :(",
    { type: ActivityType.Playing }
  );
  message.reply(`text2img is now ${client.aiEnabled ? "enabled" : "disabled"}`);
};

exports.conf = {
  aliases: ["toggleAI", "toggleai", "toggleAi", "toggle", "ai"],
  permLevel: 4,
};

exports.help = {
  name: "toggleAI",
  description: "Turns ai on/off",
  usage: "~toggleAi",
};
