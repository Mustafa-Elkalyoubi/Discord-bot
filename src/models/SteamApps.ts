import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface SteamApp {
  appID: number;
  name: string;
}

const SteamAppSchema = new Schema<SteamApp>(
  {
    appID: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "steamApps" }
);

const SteamApps = mongoose.model("steamApps", SteamAppSchema);

export default SteamApps;
