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
import { Command, BaseSubCommand, ContextCommand, messageProps, reminderDetails } from "../types";
import { DateTime } from "luxon";
import { GREEN, DEFAULT } from "./ConsoleText";

export default class ExtendedClient extends Client {
  public commands: Collection<string, Command>;
  public subCommands: Collection<string, BaseSubCommand>;
  public contextCommands: Collection<string, ContextCommand>;
  public messageCommands: Collection<string, messageProps>;
  public aliases: Collection<string, string>;
  public reminders: { [index: string]: Array<reminderDetails> };
  public reminderTimeouts: NodeJS.Timeout[];
  public osrsItems: Array<{ name: string; value: string }>;
  public aiEnabled: Boolean;
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

    this._reminderPath = path.join(__dirname, "..", "data", "reminders.json");

    const itemIDPath = path.join(__dirname, "..", "data", "itemIDs.json");

    this.rest.setToken(token);

    this.osrsItems = Object.entries(JSON.parse(fs.readFileSync(itemIDPath, "utf-8"))).map(
      (item) => {
        return { name: item[0] as string, value: item[1] as string };
      }
    );
  }

  public reload(command: string) {
    const messagesPath = path.join(__dirname, "..", "message_commands");

    return new Promise((resolve, reject) => {
      try {
        let cmdPath = path.join(messagesPath, command);
        delete require.cache[require.resolve(cmdPath)];
        let cmd = require(cmdPath);
        this.aliases.forEach((cmd, alias) => {
          if (cmd === command) this.aliases.delete(alias);
        });
        this.messageCommands.set(command, cmd);
        cmd.conf.aliases.forEach((alias: string) => {
          this.aliases.set(alias, cmd.help.name);
        });
        resolve(null);
      } catch (err) {
        reject(err);
      }
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
      var newReminderTime = DateTime.fromFormat(`${day} ${hour} ${minute}`, "ccc H m");
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
    for (var userID in this.reminders) {
      for (var reminder of this.reminders[userID]) {
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

  public isJSONString(str: any) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
