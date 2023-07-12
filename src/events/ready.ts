import { BaseGuildTextChannel, Collection, Events, TextChannel } from "discord.js";
import { reminderDetails } from "../types";
import { LIGHT_GREEN, DEFAULT, LIGHT_BLUE } from "../utils/ConsoleText";
import path from "path";
import fs from "node:fs";
import { DateTime } from "luxon";
import axios from "axios";
import ExtendedClient from "../utils/Client";

interface MiscFile {
  reboot: {
    time: number;
    channelID: string;
    messageID: string;
    shouldMessage: boolean;
  };
  shouldUpdateItems: boolean;
}

type AxiosData = Array<{
  examine: string;
  id: number;
  members: boolean;
  lowalch: number;
  limit: number;
  value: number;
  highalch: number;
  icon: string;
  name: string;
}>;

export = {
  name: Events.ClientReady,
  once: true,
  run: async (client: ExtendedClient) => {
    if (!client.user) throw "What? (check ready.ts)";
    const dataPath = path.join(__dirname, "..", "data");
    var reminderPath = path.join(dataPath, "reminders.json");
    client.reminders = JSON.parse(fs.readFileSync(reminderPath, "utf-8"));

    console.log(`${LIGHT_BLUE}Ready, logged in as ${client.user.tag + DEFAULT}`);
    client.reloadTimeouts();

    var miscPath = path.join(dataPath, "misc.json");
    const misc = (await JSON.parse(fs.readFileSync(miscPath, "utf-8"))) as MiscFile;
    if (misc.reboot && misc.reboot.shouldMessage) {
      await editRebootMessage(misc, client);
    }
    if (misc.shouldUpdateItems) {
      updateOSRSItems(misc, client);
    }
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

  var miscPath = path.join(__dirname, "..", "data", "misc.json");
  fs.writeFileSync(miscPath, JSON.stringify(misc, null, 4));
}

async function updateOSRSItems(misc: MiscFile, client: ExtendedClient) {
  const url = `https://prices.runescape.wiki/api/v1/osrs/mapping`;
  var config = {
    headers: { "User-Agent": "Discord Bot - Jiggly Jelly#6009" },
  };

  var items = await axios.get(url, config).catch((e: Error) => {
    if (axios.isAxiosError(e)) {
      if (e.cause && e.cause.name !== "ECONNREFUSED") console.error(e);
      else console.log("Failed to connect to wiki servers");
    }
  });
  if (!items) return;

  const itemData = items.data as AxiosData;
  const itemsObj = Object.fromEntries(itemData.map((item) => [item.name, `${item.id}`]));

  client.osrsItems = itemData.map((item) => {
    return { name: item.name, value: `${item.id}` };
  });

  const dataPath = path.join(__dirname, "..", "data");
  fs.writeFileSync(path.join(dataPath, "itemIDs.json"), JSON.stringify(itemsObj, null, 4));
  misc.shouldUpdateItems = false;
  fs.writeFileSync(path.join(dataPath, "misc.json"), JSON.stringify(misc, null, 4));
  console.log(`Updated OSRS Item IDs`);
}
