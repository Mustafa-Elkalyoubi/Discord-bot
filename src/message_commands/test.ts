import axios from "axios";
import { Message } from "discord.js";

const apiURL = "https://dbd.tricky.lol/api/perks";

exports.run = async (message: Message, args: string[]) => {
  console.log("not implemented");
};

exports.conf = {
  aliases: ["t"],
  permLevel: 4,
};

exports.help = {
  name: "test",
  description: "testing lol",
  usage: "ya ok",
};
