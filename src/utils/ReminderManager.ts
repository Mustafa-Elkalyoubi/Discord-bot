import { ChatInputCommandInteraction } from "discord.js";
import { DateTime } from "luxon";
import { RecurrenceRule, scheduleJob, scheduledJobs } from "node-schedule";

import mongoose, { Types } from "mongoose";
import UserData from "../models/UserData";
import type { ReminderDetails } from "../types";
import ExtendedClient from "./Client";

export default class ReminderManager {
  #client: ExtendedClient;

  constructor(client: ExtendedClient) {
    this.#client = client;
    this.#loadJobs();
  }

  async #loadJobs() {
    const reminders = await UserData.aggregate([
      {
        $unwind: "$reminders",
      },
      {
        $project: {
          _id: "$reminders._id",
          userID: true,
          message: "$reminders.message",
          timeToRemind: "$reminders.timeToRemind",
          channel: "$reminders.channel",
          recurring: "$reminders.recurring",
          details: "$reminders.details",
        },
      },
    ]);

    if (!reminders) throw "Failed to load reminders";

    reminders.forEach((reminder) => {
      if (DateTime.now() >= reminder.timeToRemind) return this.execute(reminder, reminder.userID);

      if (!reminder.recurring)
        scheduleJob(reminder._id.toString(), reminder.timeToRemind, () => {
          this.execute(reminder, reminder.userID);
        });
      else {
        const rule = new RecurrenceRule(
          undefined,
          undefined,
          undefined,
          reminder.details.day,
          reminder.details.hour,
          reminder.details.minute
        );
        scheduleJob(reminder._id.toString(), rule, () => {
          this.execute(reminder, reminder.userID);
        });
      }
    });
  }

  async getUserReminders(userID: string) {
    return (await UserData.findOne({ userID }))?.reminders ?? [];
  }

  async get(reminderID: string) {
    return UserData.findOne({
      reminders: {
        $elemMatch: {
          id: reminderID,
        },
      },
    }).get(reminderID);
  }

  execute(reminder: ReminderDetails, userID: string) {
    this.#client.sendToChannel(reminder.channel, `<@!${userID}>: ${reminder.message}`);

    if (!reminder.recurring) this.remove(reminder._id, userID);
  }

  async remove(reminderID: Types.ObjectId, userID: string) {
    await UserData.updateOne(
      {
        userID,
      },
      {
        $pull: {
          reminders: {
            _id: reminderID,
          },
        },
      },
      { upsert: false }
    );

    if (reminderID.toString() in scheduledJobs) scheduledJobs[reminderID.toString()].cancel();
  }

  async save(
    interaction: ChatInputCommandInteraction,
    message: string,
    timeToRemind: DateTime
  ): Promise<void>;
  async save(
    interaction: ChatInputCommandInteraction,
    message: string,
    timeToRemind: DateTime,
    recurring: true,
    day: string,
    hour: number,
    minute: number
  ): Promise<void>;
  async save(
    interaction: ChatInputCommandInteraction,
    message: string,
    timeToRemind: DateTime,
    recurring = false,
    day?: string,
    hour?: number,
    minute?: number
  ): Promise<void> {
    const userID = interaction.user.id;

    if (!interaction.channel) throw "No idea how this error occurred";

    let user = await UserData.findOne({ userID: userID });
    if (!user) user = new UserData({ userID, username: interaction.user.username });

    const saveDetails = {
      _id: new mongoose.Types.ObjectId(),
      channel: interaction.channel.id,
      message,
      timeToRemind: timeToRemind.toJSDate()!,
      recurring: recurring,
      ...(recurring && {
        details: {
          day,
          hour,
          minute,
        },
      }),
    } as ReminderDetails;

    user.reminders.push(saveDetails);

    try {
      user.save();

      if (saveDetails.recurring) {
        interaction.reply({
          content: `\`RECURRING\` Reminder [${saveDetails._id}] set! Reminding you <t:${Math.floor(
            timeToRemind.toSeconds()
          )}:R> (Every ${DateTime.fromFormat(`${day} ${hour} ${minute}`, "ccc H m").toFormat(
            "EEEE 'at' H':'mm"
          )})`,
        });
        return;
      }
      interaction.reply({
        content: `Reminder \`${saveDetails._id}\` set! Reminding you <t:${Math.floor(
          timeToRemind.toSeconds()
        )}:R>`,
      });

      scheduleJob(saveDetails._id.toString(), timeToRemind.toJSDate()!, () => {
        this.execute(saveDetails, userID);
      });
    } catch (err) {
      interaction.reply({ content: "Sorry, something went wrong", ephemeral: true });
    }
  }
}
