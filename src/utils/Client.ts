import { ChannelType, Client, ClientOptions, TextChannel } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { OSRSWikiData } from "../types";
import { DateTime } from "luxon";
import Modifiers, { DEFAULT } from "./ConsoleText";
import axios, { AxiosRequestConfig } from "axios";
import DBDManager from "./DBDManager";
import ReminderManager from "./ReminderManager";
import CommandManager from "./CommandManager";

export default class ExtendedClient extends Client {
  public osrsItems: Array<{ name: string; value: string }>;
  public dbd: DBDManager;
  public reminders: ReminderManager;
  public commandManager: CommandManager;

  public aiEnabled: boolean;
  public aiQueue: { userID: string; interactionID: string }[];
  public ownerID: string;

  constructor(options: ClientOptions, ownerID: string, token: string, aiEnabled = false) {
    super(options);
    const dataPath = path.join(__dirname, "..", "data");

    this.aiQueue = [];
    this.aiEnabled = aiEnabled;
    this.ownerID = ownerID;
    this.dbd = new DBDManager(dataPath);
    this.reminders = new ReminderManager(this, dataPath);
    this.commandManager = new CommandManager(this, ownerID);

    const osrsItemsPath = path.join(dataPath, "itemIDs.json");

    this.rest.setToken(token);

    if (!fs.existsSync(osrsItemsPath)) {
      this.osrsItems = [];
      this.getOSRSItems();
    } else
      this.osrsItems = Object.entries(JSON.parse(fs.readFileSync(osrsItemsPath, "utf-8"))).map(
        (item) => ({ name: item[0], value: item[1] as string })
      );
  }

  public log(location: string, message: string, color: string = DEFAULT) {
    console.log(
      `${Modifiers.MAGENTA}${location} [${DateTime.now().toFormat(
        "HH:mm:ss"
      )}] ${color}${message}${DEFAULT}`
    );
  }

  public async findTextChannel(name: string, guildID: string) {
    const guild = await this.guilds.fetch(guildID);
    if (!guild) {
      this.log("findTextChannel", `Could not find guild with id ${guildID}`, Modifiers.RED);
      return null;
    }

    const channels = await guild.channels.fetch();
    if (!channels) {
      this.log("findTextChannel", `guild ${guild.id} does not have channels?`);
      return null;
    }

    const channel = channels.find(
      (channel) => channel && channel.name.includes(name) && channel.type === ChannelType.GuildText
    );
    if (!channel) return null;
    return channel as TextChannel;
  }

  public async sendToChannel(channelID: string, message: string) {
    const channel = (await this.channels.fetch(channelID)) as TextChannel;
    channel.send(message);
  }

  public isJSONString(str: unknown) {
    try {
      if (typeof str === "string") JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  public async getOSRSItems() {
    const apiURL = "https://prices.runescape.wiki/api/v1/osrs/mapping";
    const config: AxiosRequestConfig = {
      headers: {
        "User-Agent": "Discord Bot - @birbkiwi",
        "Content-Type": "application/json",
      },
      timeout: 60000,
    };

    const res = await axios.get<OSRSWikiData>(apiURL, config).catch((e: Error) => {
      if (axios.isAxiosError(e)) {
        if (e.cause && e.cause.name !== "ECONNREFUSED") console.error(e);
        else console.log("Failed to connect to wiki servers");
      }
    });
    if (!res) return;

    const items = Object.fromEntries(res.data.map((item) => [item.name, `${item.id}`]));
    const osrsItemPath = path.join(__dirname, "..", "data", "itemIDs.json");

    this.osrsItems = res.data.map((item) => {
      return { name: item.name, value: `${item.id}` };
    });

    fs.writeFile(osrsItemPath, JSON.stringify(items, null, 4), { flag: "w" }, (err) => {
      if (err) throw err;
      console.log("OSRS Items updated");
    });
  }
}
