import { Events, Message } from "discord.js";
import ExtendedClient from "../utils/Client";
import { CYAN, DEFAULT, YELLOW } from "../utils/ConsoleText";
import { DateTime } from "luxon";
import config from "../config.json";
import fs from "node:fs";
import path from "node:path";

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
    const command = message.content.split(" ")[0].slice(config.prefix.length).toLowerCase();
    const args = message.content.split(" ").slice(1);
    const perms = client.elevation(message);
    let cmd;

    if (client.messageCommands?.has(command)) cmd = client.messageCommands.get(command);
    else if (client.aliases?.has(command))
      cmd = client.messageCommands?.get(client.aliases.get(command)!);

    if (cmd) {
      if (perms < cmd.conf.permLevel)
        return message.reply("You don't have the permissions to use that");
      cmd.run(message, args, client);
    }
  },
};

interface fineData {
  [k: string]: {
    username: string;
    fineAmount: number;
    fineCap: number;
    capReached: boolean;
  };
}

async function forFun(message: Message) {
  const finePath = path.join(__dirname, "..", "data", "fines.json");
  const authorID = message.author.id;

  if (message.content.includes("🥹")) {
    const fines = (await JSON.parse(fs.readFileSync(finePath, "utf-8"))) as fineData;

    if (!fines[authorID])
      fines[authorID] = {
        username: message.author.username,
        fineAmount: 0,
        fineCap: 5000,
        capReached: false,
      };

    const { fineAmount: currentFine, fineCap: cap } = fines[authorID];

    if (currentFine >= cap) return message.react(`855089585919098911`);

    // in case user changed username
    fines[authorID].username = message.author.username;

    // Percentage of max is 20% - 10%
    var percentageOfCap = ((0.2 - 0.1) / (5000 - 1000000000)) * (cap - 1000000000) + 0.1;
    if (percentageOfCap < 0.1) percentageOfCap = 0.1;
    // Random for cap between max % of cap and 3.5% of the cap
    const randomAmount = Math.floor(Math.random() * (cap * percentageOfCap) + cap * 0.035);
    const thisFine =
      randomAmount + currentFine >= cap ? cap - fines[authorID].fineAmount : randomAmount;
    fines[authorID].fineAmount += thisFine;

    if (fines[authorID].fineAmount >= cap) {
      fines[authorID].capReached = true;
      fs.writeFileSync(finePath, JSON.stringify(fines, null, 4));
      return message.reply(
        `You have reached the fine limit ( ***${BigInt(fines[message.author.id].fineCap)
          .toString()
          .replace(
            /\B(?=(\d{3})+(?!\d))/g,
            ","
          )}*** ), you must post <:waaah:1016423553320628284> to pay for your crimes`
      );
    }

    fs.writeFileSync(finePath, JSON.stringify(fines, null, 4));
    return message.reply(
      `Do not 🥹 (${BigInt(thisFine)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} fine). Your total is **${BigInt(
        fines[message.author.id].fineAmount
      )
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}**`
    );
  }

  if (message.content.includes("<:waaah:1016423553320628284>")) {
    const fines = (await JSON.parse(fs.readFileSync(finePath, "utf-8"))) as fineData;

    if (!fines[authorID]) return;
    if (fines[authorID].fineAmount <= 0) return;

    const { fineAmount: prevFine, capReached } = fines[authorID];
    // in case user changed username
    fines[authorID].username = message.author.username;
    fines[authorID].fineAmount = 0;

    if (capReached) fines[authorID].fineCap *= 2;
    fines[authorID].capReached = false;
    fs.writeFileSync(finePath, JSON.stringify(fines, null, 4));
    message.reply(
      `Your fines have all been paid (**${BigInt(prevFine)}**)${
        BigInt(capReached)
          ? `, fine cap has increased to ${BigInt(fines[message.author.id].fineCap)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
          : ``
      }`
    );
  }
}
