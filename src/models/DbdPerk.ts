import mongoose, { Schema, Types } from "mongoose";

export interface IDbdPerk {
  id: string;
  name: string;
  description: string;
  image: string;
  character: number | null;
  role: "killer" | "survivor";
  char?: Types.ObjectId;
}

const DbdPerkSchema = new Schema<IDbdPerk>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    character: { type: Number, required: false, default: null },
    role: { type: String, required: true, enum: ["killer", "survivor"] },
  },

  { timestamps: false, collection: "dbdPerks" }
);

const DbdPerk = mongoose.model("dbdPerks", DbdPerkSchema);

export default DbdPerk;
