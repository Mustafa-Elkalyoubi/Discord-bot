import type { Snowflake } from "discord.js";
import mongoose from "mongoose";
import type { ReminderDetails } from "../types.js";

const Schema = mongoose.Schema;

interface IFine {
  fineAmount: string;
  fineCap: string;
  capReached: boolean;
}

export interface IUserData {
  userID: Snowflake;
  username: string;
  reminders: ReminderDetails[];
  fines: IFine;
}

const UserDataSchema = new Schema<IUserData>(
  {
    userID: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    reminders: [
      {
        _id: {
          type: mongoose.Schema.ObjectId,
          index: true,
          required: true,
          auto: true,
          unique: true,
        },
        message: {
          type: String,
          required: true,
        },
        timeToRemind: {
          type: Date,
          required: false,
        },
        channel: {
          type: String,
          required: true,
        },
        recurring: {
          type: Boolean,
          required: true,
        },
        details: {
          required: false,
          type: {
            day: { type: Number, required: true },
            hour: { type: Number, required: true },
            minute: { type: Number, required: true },
          },
        },
      },
    ],

    fines: {
      fineAmount: {
        type: String,
        required: true,
        default: "0",
      },
      fineCap: {
        type: String,
        required: true,
        default: "5000",
      },
      capReached: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
  },
  { timestamps: true, collection: "users" }
);

const UserData = mongoose.model("users", UserDataSchema);

export default UserData;
