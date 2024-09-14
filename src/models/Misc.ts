import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IMisc {
  reboot: {
    time: number;
    channelID: string;
    messageID: string;
    shouldMessage: boolean;
  };
  shouldUpdateItems: boolean;
}

const MiscSchema = new Schema<IMisc>(
  {
    reboot: {
      time: Number,
      channelID: String,
      messageID: String,
      shouldMessage: Boolean,
    },
    shouldUpdateItems: Boolean,
  },
  { timestamps: false, collection: "misc" }
);

const Misc = mongoose.model("misc", MiscSchema);

export default Misc;
