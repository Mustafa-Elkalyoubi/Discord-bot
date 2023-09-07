import {
  ChatInputCommandInteraction,
  Client,
  ClientOptions,
  Collection,
  Message,
  PermissionsBitField,
  TextChannel,
} from "discord.js";
import fs from "node:fs";
import path from "node:path";
import {
  Command,
  BaseSubCommand,
  ContextCommand,
  messageProps,
  reminderDetails,
  OSRSWikiData,
  DBDPerk,
  DBDCharacter,
  DBDDLC,
  DBDPower,
} from "../types";
import { DateTime } from "luxon";
import { GREEN, DEFAULT } from "./ConsoleText";
import axios, { AxiosRequestConfig } from "axios";

const dbdApiUrl = "https://dbd.tricky.lol/api/";

export default class ExtendedClient extends Client {
  public commands: Collection<string, Command>;
  public subCommands: Collection<string, BaseSubCommand>;
  public contextCommands: Collection<string, ContextCommand>;
  public messageCommands: Collection<string, messageProps>;
  public aliases: Collection<string, string>;
  public reminders: { [index: string]: Array<reminderDetails> };
  public reminderTimeouts: NodeJS.Timeout[];
  public osrsItems: Array<{ name: string; value: string }>;
  public dbdPerks: DBDPerk[];
  public dbdChars: DBDCharacter[];
  public dbdDLC: DBDDLC[];
  public dbdPowers: DBDPower[];
  public aiEnabled: boolean;
  public aiQueue: { userID: string; interactionID: string }[];
  public ownerID: string;

  private _reminderPath: string;

  constructor(options: ClientOptions, ownerID: string, token: string, aiEnabled = false) {
    super(options);
    this.commands = new Collection();
    this.subCommands = new Collection();
    this.contextCommands = new Collection();
    this.messageCommands = new Collection();
    this.aliases = new Collection();
    this.reminders = {};
    this.reminderTimeouts = [];
    this.aiQueue = [];
    this.aiEnabled = aiEnabled;
    this.ownerID = ownerID;

    const dataPath = path.join(__dirname, "..", "data");

    this._reminderPath = path.join(dataPath, "reminders.json");

    const osrsItemsPath = path.join(dataPath, "itemIDs.json");
    const dbdPerkFilePath = path.join(dataPath, "dbdPerks.json");
    const dbdCharFilePath = path.join(dataPath, "dbdChars.json");
    const dbdDLCFilePath = path.join(dataPath, "dbdDLC.json");
    const dbdPowerFilePath = path.join(dataPath, "dbdPower.json");

    this.rest.setToken(token);

    if (!fs.existsSync(osrsItemsPath)) {
      this.osrsItems = [];
      this.getOSRSItems();
    } else
      this.osrsItems = Object.entries(JSON.parse(fs.readFileSync(osrsItemsPath, "utf-8"))).map(
        (item) => {
          return { name: item[0] as string, value: item[1] as string };
        }
      );

    this.dbdPerks = [];
    this.dbdChars = [];
    this.dbdDLC = [];
    this.dbdPowers = [];

    if (!fs.existsSync(dbdPerkFilePath)) this.getDBDPerks();
    else this.dbdPerks = JSON.parse(fs.readFileSync(dbdPerkFilePath, "utf-8"));

    if (!fs.existsSync(dbdCharFilePath)) this.getDBDChars();
    else this.dbdChars = JSON.parse(fs.readFileSync(dbdCharFilePath, "utf-8"));

    if (!fs.existsSync(dbdDLCFilePath)) this.getDBDDLC();
    else this.dbdDLC = JSON.parse(fs.readFileSync(dbdDLCFilePath, "utf-8"));

    if (!fs.existsSync(dbdPowerFilePath)) this.getDBDPowers();
    else this.dbdPowers = JSON.parse(fs.readFileSync(dbdPowerFilePath, "utf-8"));
  }

  public async reload(command: string) {
    const messagesPath = path.join(__dirname, "..", "message_commands");

    const cmdPath = path.join(messagesPath, command);
    const cmd = await import(cmdPath);
    return new Promise((resolve) => {
      delete require.cache[require.resolve(cmdPath)];
      this.aliases.forEach((cmd, alias) => {
        if (cmd === command) this.aliases.delete(alias);
      });
      this.messageCommands.set(command, cmd);
      cmd.conf.aliases.forEach((alias: string) => {
        this.aliases.set(alias, cmd.help.name);
      });
      resolve(null);
    });
  }

  public elevation(message: Message) {
    let permlevel = 0;
    if (message.author.id === this.ownerID) return 4;
    if (message.guild === null) return 0;

    const flags = PermissionsBitField.Flags;
    const hasPerm = (flag: bigint) => message.member?.permissions.has(flag);

    if (
      hasPerm(flags.ManageRoles) &&
      hasPerm(flags.ManageChannels) &&
      hasPerm(flags.ManageMessages)
    )
      permlevel = 2;
    if (hasPerm(flags.Administrator)) permlevel = 3;

    return permlevel;
  }

  public log(location: string, message: string) {
    console.log(
      `${GREEN}${location} [${DateTime.now().toFormat("HH:mm:ss")}] ${DEFAULT}${message}`
    );
  }

  public async sendToChannel(channelID: string, message: string) {
    const channel = (await this.channels.fetch(channelID)) as TextChannel;
    channel.send(message);
  }

  public executeReminder(reminder: reminderDetails, userID: string) {
    this.sendToChannel(reminder.channel, `<@!${userID}>: ${reminder.message}`);

    if (!reminder.recurring) {
      this.reminders[userID].splice(this.reminders[userID].indexOf(reminder), 1);
      if (this.reminders[userID].length < 1) delete this.reminders[userID];
    } else {
      if (!reminder.details) throw "Recurring details missing in reminder";
      const { day, hour, minute } = reminder.details;
      let newReminderTime = DateTime.fromFormat(`${day} ${hour} ${minute}`, "ccc H m");
      if (newReminderTime.toMillis() < DateTime.now().toMillis())
        newReminderTime = newReminderTime.plus({ days: 7 });
      reminder.timeToRemind = newReminderTime.toMillis();
    }

    this.reloadTimeouts();

    try {
      fs.writeFileSync(this._reminderPath, JSON.stringify(this.reminders, null, 4));
    } catch (e) {
      console.error(e);
    }
  }

  public reloadTimeouts() {
    for (const timeout of this.reminderTimeouts) clearTimeout(timeout);
    this.reminderTimeouts = [];
    for (const userID in this.reminders) {
      for (const reminder of this.reminders[userID]) {
        const timeout = setTimeout(() => {
          this.executeReminder(reminder, userID);
        }, reminder.timeToRemind - DateTime.now().toMillis());
        this.reminderTimeouts.push(timeout);
      }
    }
  }

  public async saveReminder(
    interaction: ChatInputCommandInteraction,
    message: string,
    timeToRemind: number,
    recurring = false,
    day: string | null = null,
    hour: number | null = null,
    minute: number | null = null
  ) {
    const userID = interaction.user.id;
    if (!this.reminders[userID]) {
      this.reminders[userID] = [];
      this.reminders[userID] = [];
    }

    if (!interaction.channel) throw "No idea how this error occurred";
    const saveDetails = {
      id: DateTime.now().toMillis() + parseInt(userID),
      channel: interaction.channel.id,
      message: message,
      timeToRemind: timeToRemind,
      recurring: recurring,
    };

    this.reminders[userID].push(saveDetails);

    try {
      fs.writeFileSync(this._reminderPath, JSON.stringify(this.reminders, null, 4));
      if (saveDetails.recurring)
        return interaction.reply({
          content: `\`RECURRING\` Reminder [${saveDetails.id}] set! Reminding you <t:${Math.floor(
            timeToRemind / 1000
          )}:R> (Every ${DateTime.fromFormat(`${day} ${hour} ${minute}`, "ccc H m").toFormat(
            "EEEE 'at' H':'mm"
          )})`,
        });
      interaction.reply({
        content: `Reminder \`${saveDetails.id}\` set! Reminding you <t:${Math.floor(
          timeToRemind / 1000
        )}:R>`,
      });

      setTimeout(() => {
        this.executeReminder(saveDetails, userID);
      }, saveDetails.timeToRemind - DateTime.now().toMillis());
    } catch (err) {
      interaction.reply({ content: "Sorry, something went wrong", ephemeral: true });
      console.error(err);
    }
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

  private sanitizeHTML = (str: string) => {
    return str
      .replace(/<b>(.*?)<\/b>/g, "**$1**")
      .replace(/<br>/g, "\n")
      .replace(/<i>(.*?)<\/i>/g, "*$1*")
      .replace(/<li>(.*?)<\/li>/g, "• $1\n")
      .replace(/&nbsp;/g, " ");
  };

  private async getDBDPerks() {
    interface ObjTunables {
      [key: string]: string[];
    }

    interface PerkData extends DBDPerk {
      categories: string[] | null;
      tunables: string[][] | ObjTunables;
      modifier: string;
      teachable: number;
    }

    interface DBDPerkApiData {
      [k: string]: PerkData;
    }

    const perkData = await axios.get<DBDPerkApiData>(dbdApiUrl + "perks", {
      headers: {
        "User-Agent": "Discord Bot - birbkiwi",
      },
    });

    if (perkData.status !== 200) return console.error(perkData);

    const dbdPerks = Object.entries(perkData.data).map(([perkID, perk]) => {
      let tunables: ObjTunables = {};
      if (Array.isArray(perk.tunables)) {
        for (let i = 0; i < perk.tunables.length; i++) {
          tunables[i] = [perk.tunables[i][perk.tunables[i].length - 1]];
        }
      } else tunables = perk.tunables;

      for (const key in perk.tunables) {
        perk.description = perk.description.replace(
          new RegExp("\\{" + key + "\\}", "gi"),
          `<b>${tunables[key][tunables[key].length - 1]}</b>`
        );
      }

      return {
        id: perkID,
        name: perk.name,
        character: perk.character,
        description: this.sanitizeHTML(perk.description),
        image: perk.image,
        role: perk.role,
      } as DBDPerk;
    });

    this.dbdPerks = dbdPerks;

    const dbdPerkFilePath = path.join(__dirname, "..", "data", "dbdPerks.json");
    fs.writeFile(dbdPerkFilePath, JSON.stringify(dbdPerks, null, 4), { flag: "w" }, (err) => {
      if (err) throw err;
      console.log("DBD perks retrieved");
    });
  }

  private async getDBDChars() {
    interface DBDCharApiData {
      [k: string]: Omit<DBDCharacter, "charid">;
    }

    const charData = await axios.get<DBDCharApiData>(dbdApiUrl + "characters", {
      headers: {
        "User-Agent": "Discord Bot - birbkiwi",
      },
    });

    if (charData.status !== 200) return console.error(charData);

    const dbdChars = Object.entries(charData.data).map(
      ([key, char]) =>
        ({
          charid: key,
          name: char.name,
          role: char.role,
          id: char.id,
          gender: char.gender,
          dlc: char.dlc,
          image: char.image,
          item: char.item,
        } as DBDCharacter)
    );

    this.dbdChars = dbdChars;

    const dbdCharFilePath = path.join(__dirname, "..", "data", "dbdChars.json");
    fs.writeFile(dbdCharFilePath, JSON.stringify(dbdChars, null, 4), { flag: "w" }, (err) => {
      if (err) throw err;
      console.log("DBD chars retrieved");
    });
  }

  private async getDBDDLC() {
    interface DBDDLCApiData {
      [k: string]: Omit<DBDDLC, "id">;
    }
    const dlcData = await axios.get<DBDDLCApiData>(dbdApiUrl + "dlc", {
      headers: {
        "User-Agent": "Discord Bot - birbkiwi",
      },
    });
    if (dlcData.status !== 200) return console.error(dlcData);

    const dbdDlc = Object.entries(dlcData.data).map(([key, dlc]) => {
      return {
        id: key,
        name: dlc.name,
        steamid: dlc.steamid,
        time: dlc.time,
      } as DBDDLC;
    });

    this.dbdDLC = dbdDlc;

    const dbdDLCFilePath = path.join(__dirname, "..", "data", "dbdDLC.json");
    fs.writeFile(dbdDLCFilePath, JSON.stringify(dbdDlc, null, 4), { flag: "w" }, (err) => {
      if (err) throw err;
      console.log("DBD dlcs retrieved");
    });
  }

  private async getDBDPowers() {
    interface DBDPowerApiData {
      [k: string]: Omit<DBDPower, "id">;
    }

    const powerData = await axios.get<DBDPowerApiData>(dbdApiUrl + "items", {
      headers: {
        "User-Agent": "Discord Bot - birbkiwi",
      },
      params: {
        role: "killer",
        type: "power",
      },
    });
    if (powerData.status !== 200) return console.error(powerData);

    const dbdPower = Object.entries(powerData.data).map(([key, power]) => ({
      id: key,
      name: this.sanitizeHTML(power.name),
      description: this.sanitizeHTML(power.description),
      image: power.image,
    }));

    this.dbdPowers = dbdPower;

    const dbdPowerFilePath = path.join(__dirname, "..", "data", "dbdPower.json");
    fs.writeFile(dbdPowerFilePath, JSON.stringify(dbdPower, null, 4), { flag: "w" }, (err) => {
      if (err) throw err;
      console.log("DBD Powers retrieved");
    });
  }

  public async getDBDData() {
    this.getDBDPerks();
    this.getDBDChars();
    this.getDBDDLC();
    this.getDBDPowers();
  }
}
