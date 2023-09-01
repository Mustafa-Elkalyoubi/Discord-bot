import { ActivityType, Events, GuildTextBasedChannel, TextChannel, codeBlock } from "discord.js";
import { FineData } from "../types";
import { DEFAULT, LIGHT_BLUE } from "../utils/ConsoleText";
import path from "path";
import fs from "node:fs";
import ExtendedClient from "../utils/Client";
import { beautifyNumber, calcAndSaveFine } from "../utils/FineHelper";

interface MiscFile {
  reboot: {
    time: number;
    channelID: string;
    messageID: string;
    shouldMessage: boolean;
  };
}

export = {
  name: Events.ClientReady,
  once: true,
  run: async (client: ExtendedClient) => {
    if (!client.user) throw "What? (check ready.ts)";
    const dataPath = path.join(__dirname, "..", "data");
    const reminderPath = path.join(dataPath, "reminders.json");
    client.reminders = JSON.parse(fs.readFileSync(reminderPath, "utf-8"));

    console.log(`${LIGHT_BLUE}Ready, logged in as ${client.user.tag + DEFAULT}`);
    client.reloadTimeouts();

    const miscPath = path.join(dataPath, "misc.json");
    const misc = (await JSON.parse(fs.readFileSync(miscPath, "utf-8"))) as MiscFile;
    if (misc.reboot && misc.reboot.shouldMessage) {
      await editRebootMessage(misc, client);
    }

    client.user.setActivity(
      client.aiEnabled ? "Text2Img is enabled :)" : "Text2Img is disabled :(",
      { type: ActivityType.Playing }
    );

    const finePath = path.join(__dirname, "..", "data", "fines.json");
    const fines = (await JSON.parse(fs.readFileSync(finePath, "utf-8"))) as FineData;
    if (!fines.lastMessageID) return;
    const fineChannel = (await client.channels.fetch(
      "852270452142899213"
    )) as GuildTextBasedChannel;
    const missedMessages = await fineChannel.messages.fetch({ after: fines.lastMessageID });

    const finesToAddUp: {
      length: number;
      fines: { [k: string]: { amount: number; username: string; id: string } };
    } = { length: 0, fines: {} };
    missedMessages.forEach(async (message) => {
      if (!message.content.includes("🥹") || message.author.bot) return;

      const thisFine = calcAndSaveFine(message, fines);

      if (!finesToAddUp.fines[message.author.id]) {
        finesToAddUp.fines[message.author.id] = {
          amount: thisFine,
          username: message.author.username,
          id: message.author.id,
        };
        finesToAddUp.length++;
        return;
      }
      finesToAddUp.fines[message.author.id].amount += thisFine;
    });

    if (finesToAddUp.length < 1) return;
    if (finesToAddUp.length === 1) {
      const onlyGuy = Object.values(finesToAddUp.fines)[0];
      const amount = beautifyNumber(onlyGuy.amount);
      const capReached = fines.userFineData[onlyGuy.id].capReached;
      const fineAmount = beautifyNumber(fines.userFineData[onlyGuy.id].fineAmount);
      fineChannel.send(
        `You shouldnt be sending 🥹 even while I'm gone, ${
          Object.values(finesToAddUp.fines)[0].username
        }\nYou've earned ${amount} fines${
          capReached
            ? " and you've hit the cap: send <:waaah:1016423553320628284> to pay for your crimes"
            : `, your total is ${fineAmount}`
        }`
      );
    } else {
      const msgs = [];
      for (const userFine of Object.values(finesToAddUp.fines)) {
        const amount = beautifyNumber(userFine.amount);
        const capReached = fines.userFineData[userFine.id].capReached;
        const fineAmount = beautifyNumber(fines.userFineData[userFine.id].fineAmount);
        msgs.push(
          `• ${userFine.username} has gotten ${amount} fines${
            capReached ? ` and has hit the cap` : `, with total ${fineAmount}`
          }`
        );
      }

      fineChannel.send(codeBlock(msgs.join("\n")));
    }
    fines.lastMessageID = "";
    fs.writeFileSync(finePath, JSON.stringify(fines, null, 4));
  },
};

async function editRebootMessage(misc: MiscFile, client: ExtendedClient) {
  const { messageID, channelID, time } = misc.reboot;

  const timeDiff = ((Date.now() - time) / 1000).toLocaleString("en-US", { notation: "compact" });

  const channel = (await client.channels.fetch(channelID)) as TextChannel;
  const messageObj = await channel.messages.fetch(messageID);

  if (messageObj.editable)
    await messageObj.edit(`Reboot complete! Reboot took ${timeDiff} seconds`);

  misc.reboot.shouldMessage = false;

  const miscPath = path.join(__dirname, "..", "data", "misc.json");
  fs.writeFileSync(miscPath, JSON.stringify(misc, null, 4));
}
