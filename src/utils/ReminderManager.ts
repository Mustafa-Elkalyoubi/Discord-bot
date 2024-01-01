import { ChatInputCommandInteraction, Collection } from "discord.js";
import fs from "node:fs";
import path from "path";
import { DateTime } from "luxon";

import type { ReminderDetails, ReminderSaveType } from "../types";
import ExtendedClient from "./Client";

export default class ReminderManager {
  private reminders: Collection<string, Array<ReminderDetails>>;
  private reminderTimeouts: NodeJS.Timeout[];

  private reminderPath: string;
  private client: ExtendedClient;

  constructor(client: ExtendedClient, basePath: string) {
    this.reminderPath = path.join(basePath, "reminders.json");
    this.client = client;

    this.reminders = new Collection(JSON.parse(fs.readFileSync(this.reminderPath, "utf-8")));
    this.reminderTimeouts = [];
    this.reloadTimeouts();
  }

  public get(reminderID: string) {
    return this.reminders.get(reminderID);
  }

  public execute(reminder: ReminderDetails, userID: string) {
    this.client.sendToChannel(reminder.channel, `<@!${userID}>: ${reminder.message}`);

    if (!reminder.recurring) this.remove(reminder.id, userID);
    else {
      if (!reminder.details) throw "Recurring details missing in reminder";
      const { day, hour, minute } = reminder.details;
      let newReminderTime = DateTime.fromFormat(`${day} ${hour} ${minute}`, "ccc H m");
      if (newReminderTime.toMillis() < DateTime.now().toMillis())
        newReminderTime = newReminderTime.plus({ days: 7 });
      reminder.timeToRemind = newReminderTime.toMillis();
    }

    this.reloadTimeouts();
    this.export();
  }

  public remove(reminderID: number, userID: string) {
    const reminders = this.reminders.get(userID);
    if (!reminders) throw "user has no reminders to delete";

    const reminderToDelete = reminders.findIndex((r) => r.id === reminderID);
    if (reminderToDelete === -1) throw "cannot find reminder to delete";

    reminders.splice(reminderToDelete, 1);
    if (reminders.length < 1) this.reminders.delete(userID);

    this.export();
  }

  public reloadTimeouts() {
    for (const timeout of this.reminderTimeouts) clearTimeout(timeout);

    this.reminderTimeouts = [];
    this.reminders.forEach((reminders, userID) => {
      reminders.forEach((reminder) => {
        const timeout = setTimeout(() => {
          this.execute(reminder, userID);
        }, reminder.timeToRemind - DateTime.now().toMillis());
        this.reminderTimeouts.push(timeout);
      });
    });
  }

  public async save(
    interaction: ChatInputCommandInteraction,
    message: string,
    timeToRemind: number
  ): Promise<void>;
  public async save(
    interaction: ChatInputCommandInteraction,
    message: string,
    timeToRemind: number,
    recurring: true,
    day: string,
    hour: number,
    minute: number
  ): Promise<void>;
  public async save(
    interaction: ChatInputCommandInteraction,
    message: string,
    timeToRemind: number,
    recurring = false,
    day?: string,
    hour?: number,
    minute?: number
  ): Promise<void> {
    const userID = interaction.user.id;
    const reminders = this.reminders.ensure(userID, () => []);

    if (!interaction.channel) throw "No idea how this error occurred";
    const saveDetails = {
      id: DateTime.now().toMillis() + parseInt(userID),
      channel: interaction.channel.id,
      message: message,
      timeToRemind: timeToRemind,
      recurring: recurring,
      ...(recurring && {
        details: {
          day,
          hour,
          minute,
        },
      }),
    } as ReminderDetails;

    reminders.push(saveDetails);
    this.reminders.set(userID, reminders);

    try {
      const successful = this.export();
      if (!successful) throw "Check Client.ts: 268";

      if (saveDetails.recurring) {
        interaction.reply({
          content: `\`RECURRING\` Reminder [${saveDetails.id}] set! Reminding you <t:${Math.floor(
            timeToRemind / 1000
          )}:R> (Every ${DateTime.fromFormat(`${day} ${hour} ${minute}`, "ccc H m").toFormat(
            "EEEE 'at' H':'mm"
          )})`,
        });
        return;
      }
      interaction.reply({
        content: `Reminder \`${saveDetails.id}\` set! Reminding you <t:${Math.floor(
          timeToRemind / 1000
        )}:R>`,
      });

      setTimeout(() => {
        this.execute(saveDetails, userID);
      }, saveDetails.timeToRemind - DateTime.now().toMillis());
    } catch (err) {
      interaction.reply({ content: "Sorry, something went wrong", ephemeral: true });
    }
  }

  private export() {
    try {
      fs.writeFileSync(
        this.reminderPath,
        JSON.stringify(Array.from(this.reminders.entries()) satisfies ReminderSaveType, null, 4)
      );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
