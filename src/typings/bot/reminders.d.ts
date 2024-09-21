interface BaseReminder {
  _id: import("mongoose").Types.ObjectId;
  message: string;
  channel: import("discord.js").Snowflake;
  recurring: boolean;
}

interface RecurringReminder extends BaseReminder {
  recurring: true;
  details: {
    day: number;
    hour: number;
    minute: number;
  };
}

interface RegularReminder extends BaseReminder {
  timeToRemind: Date;
  recurring: false;
}

type ReminderDetails = RegularReminder | RecurringReminder;
type ReminderSaveType = Array<[import("discord.js").Snowflake, Array<ReminderDetails>]>;
