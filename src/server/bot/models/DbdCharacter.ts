import mongoose, { Schema, Types } from "mongoose";

interface IDbdDLC {
  id: string;
  name: string;
  steamid: number;
  time: number;
}

interface IDbdPowerItem {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface IDbdCharacter {
  id: string;
  charid: number;
  name: string;
  gender: "male" | "female" | "nothuman";
  role: "killer" | "survivor";
  image: string;

  dlc: IDbdDLC | null;
  item: IDbdPowerItem | null;
  perks: [Types.ObjectId, Types.ObjectId, Types.ObjectId];
}

const DbdCharacterSchema = new Schema<IDbdCharacter>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    charid: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "nothuman", "multiple"],
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["killer", "survivor"],
      required: true,
    },

    dlc: {
      type: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        steamid: { type: Number, required: true },
        time: { type: Number, required: true },
      },
      required: false,
      default: null,
    },
    item: {
      required: false,
      default: null,
      type: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: String, required: true },
      },
    },
    perks: [{ type: Schema.Types.ObjectId, ref: "dbdPerks", minlength: 3, maxlength: 3 }],
  },
  { timestamps: false, collection: "dbdCharacters" }
);

const DbdCharacter = mongoose.model("dbdCharacters", DbdCharacterSchema);

export default DbdCharacter;
