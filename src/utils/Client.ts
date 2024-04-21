import io from "@pm2/io";
import Counter from "@pm2/io/build/main/utils/metrics/counter";
import axios, { AxiosRequestConfig } from "axios";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { ActivityType, ChannelType, Client, ClientOptions, TextChannel } from "discord.js";
import { DateTime } from "luxon";
import mongoose from "mongoose";
import { ChildProcess, spawn } from "node:child_process";
import psTree from "ps-tree";
import OsrsItem from "../models/OsrsItem";
import { OSRSWikiData } from "../types";
import CommandManager from "./CommandManager";
import Modifiers from "./ConsoleText";
import DBDManager from "./DBDManager";
import generateAIImage from "./GenerateAIImage";
import "./LuxonAdapter";
import Queue from "./Queue";
import ReminderManager from "./ReminderManager";

export default class ExtendedClient extends Client {
  private aiDIR = "C:\\Users\\Mustafa\\Desktop\\Files\\hackin\\gen\\stable-diffusion-webui";
  private aiFile = `${this.aiDIR}\\webui.bat`;
  private db: mongoose.Connection;

  public GECanvas = new ChartJSNodeCanvas({
    height: 600,
    width: 1200,
    type: "svg",
    backgroundColour: "#27292e",
  });
  public dbd: DBDManager;
  public reminders: ReminderManager;
  public commandManager: CommandManager;

  public aiProcess: ChildProcess | null = null;
  public aiQueue = new Queue(generateAIImage);
  public ownerID: string;

  public messagesLogged: Counter;
  public commandsUsed: Counter;
  public activeCommands: Counter;
  public erroredCommands: Counter;

  constructor(options: ClientOptions, ownerID: string, token: string) {
    super(options);

    mongoose.connect("mongodb://localhost:27017", {
      appName: "discord-bot",
      dbName: "discord-bot",
    });
    this.db = mongoose.connection;

    // this.db.once("open", async () => {
    // });

    this.db.on("error", (err) => {
      console.error(err);
    });

    this.ownerID = ownerID;
    this.dbd = new DBDManager();
    this.reminders = new ReminderManager(this);
    this.commandManager = new CommandManager(this, ownerID);

    this.rest.setToken(token);

    io.init();

    this.messagesLogged = io.counter({
      name: "Messages Logged",
    });

    this.commandsUsed = io.counter({
      name: "Commands Used",
    });

    this.activeCommands = io.counter({
      name: "Active Commands",
    });

    this.erroredCommands = io.counter({
      name: "Errored Commands",
    });
  }

  public log(location: string, message: string, color: string = Modifiers.DEFAULT) {
    console.log(
      `${Modifiers.MAGENTA}${location} [${DateTime.now().toFormat("HH:mm:ss")}] ${color}${message}${
        Modifiers.DEFAULT
      }`
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
    if (!channel) {
      console.error(`Failed to find channel with ID ${channelID}`);
      return;
    }

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
    if (!res) return false;

    const ops = res.data.map((item) => ({
      updateOne: {
        filter: { id: item.id },
        update: { id: item.id, name: item.name },
        upsert: true,
      },
    }));

    try {
      const result = await OsrsItem.bulkWrite(ops);
      if (result.ok) return true;
    } catch (e) {
      if (e) console.log(e);
      return false;
    }
  }

  public toggleAI() {
    this.user?.setActivity(this.aiProcess ? "Text2Img is enabled :)" : "Text2Img is disabled :(", {
      type: ActivityType.Playing,
    });

    if (!this.aiProcess) {
      try {
        this.aiProcess = spawn(
          "call",
          [this.aiFile, "--api", "--api-log", "--nowebui", "--medvram"],
          {
            cwd: this.aiDIR,
            shell: true,
            detached: true,
          }
        );

        if (!this.aiProcess.pid) throw "no pid";
      } catch (e) {
        if (e) throw e;
      }
    } else {
      psTree(this.aiProcess.pid!, (err, children) => {
        children.forEach((child) => process.kill(parseInt(child.PID), "SIGINT"));
      });
      if (this.aiProcess.pid) process.kill(this.aiProcess.pid, "SIGINT");

      this.aiProcess = null;
    }

    return Boolean(this.aiProcess);
  }
}
