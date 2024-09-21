import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IOsrsItem {
  id: number;
  name: string;
}

const OsrsItemSchema = new Schema<IOsrsItem>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "osrsItems" }
);

const OsrsItem = mongoose.model("osrsItems", OsrsItemSchema);

export default OsrsItem;
