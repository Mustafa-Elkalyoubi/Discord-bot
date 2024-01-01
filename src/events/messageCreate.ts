import { Events, Message } from "discord.js";
import ExtendedClient from "../utils/Client";
import { CYAN, DEFAULT, YELLOW } from "../utils/ConsoleText";
import config from "../config.json";
import fs from "node:fs";
import path from "node:path";
import { FineData } from "../types";
import { beautifyNumber, calcAndSaveFine } from "../utils/FineHelper";

export = {
  name: Events.MessageCreate,
  async run(message: Message, client: ExtendedClient) {
    const attachments = message.attachments;

    const log = client.log;

    if (message.author.bot) {
      if (message.channel.isDMBased()) return;
      if (message.author.id === client.user?.id) return;
      if (message.guild)
        return log(
          message.guild.name,
          `BOT ${CYAN}${message.author.username}: ${DEFAULT}${message.content}`
        );
    }

    await forFun(message);

    if (message.channel.isDMBased() || !message.guild) {
      log(
        `DM`,
        `${YELLOW}${message.author.username}: ${DEFAULT}${message.content} ${
          attachments.size > 0 ? `|| File: ${attachments.map((c) => c.url)}` : ""
        }`
      );
      client.sendToChannel(
        config.dmChannel,
        `${message.author.username} (${message.author.id}): ${message.content} ${
          message.attachments.size > 0 ? `|| File: ${message.attachments.map((c) => c.url)}` : ""
        }`
      );
    } else {
      log(
        `${message.guild.name}`,
        `${CYAN}${message.author.username}: ${DEFAULT}${message.content}${
          attachments.size > 0 ? `|| File: ${attachments.map((c) => c.url)}` : ""
        }`
      );
    }

    if (!message.content.startsWith(config.prefix)) return;
    client.commandManager.runMessageCommand(message);
  },
};

async function forFun(message: Message) {
  if (message.channel.id !== "852270452142899213") return;
  const finePath = path.join(__dirname, "..", "data", "fines.json");
  const authorID = message.author.id;
  const fines = (await JSON.parse(fs.readFileSync(finePath, "utf-8"))) as FineData;

  const lastMessageSent = message.id;
  fines.lastMessageID = lastMessageSent;

  if (message.content.includes("🥹")) {
    const thisFine = calcAndSaveFine(message, fines);

    const { capReached, fineCap, fineAmount } = fines.userFineData[authorID];

    if (capReached) {
      fs.writeFileSync(finePath, JSON.stringify(fines, null, 4));
      return message.reply(
        `You have reached the fine limit ( ***${beautifyNumber(
          fineCap
        )}*** ), you must post <:waaah:1016423553320628284> to pay for your crimes`
      );
    }

    fs.writeFileSync(finePath, JSON.stringify(fines, null, 4));
    return message.reply(
      `Do not 🥹 (${beautifyNumber(thisFine)} fine). Your total is **${beautifyNumber(fineAmount)}**`
    );
  }

  if (message.content.includes("<:waaah:1016423553320628284>")) {
    const fines = (await JSON.parse(fs.readFileSync(finePath, "utf-8"))) as FineData;

    if (!fines.userFineData[authorID]) return;
    if (fines.userFineData[authorID].fineAmount <= 0) return;

    const { fineAmount: prevFine, capReached } = fines.userFineData[authorID];
    // in case user changed username
    fines.userFineData[authorID].username = message.author.username;
    fines.userFineData[authorID].fineAmount = 0;

    if (capReached) fines.userFineData[authorID].fineCap *= 2;
    fines.userFineData[authorID].capReached = false;
    fs.writeFileSync(finePath, JSON.stringify(fines, null, 4));
    return message.reply(
      `Your fines have all been paid (**${BigInt(prevFine)}**)${
        BigInt(capReached)
          ? `, fine cap has increased to ${BigInt(fines.userFineData[message.author.id].fineCap)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
          : ``
      }`
    );
  }

  fs.writeFileSync(finePath, JSON.stringify(fines, null, 4));
}
