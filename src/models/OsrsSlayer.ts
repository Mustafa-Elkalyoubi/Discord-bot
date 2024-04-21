import mongoose from "mongoose";

const Schema = mongoose.Schema;

export interface IOsrsSlayer {
  master: string;
  monsters: Map<string, number>;
  total: number;
}

const OsrsSlayerSchema = new Schema<IOsrsSlayer>(
  {
    master: {
      type: String,
      required: true,
      unique: true,
    },
    monsters: {
      type: Map,
      of: Number,
    },
  },

  {
    timestamps: true,
    collection: "osrsSlayer",
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    virtuals: {
      total: Number,
    },
  }
);

// return Object.values(this.monsters).reduce((acc, curr) => acc + curr, 0);

OsrsSlayerSchema.virtual("total").get(function () {
  let sum = 0;
  this.monsters.forEach((v) => (sum += v));
  return sum;
});

const OsrsSlayer = mongoose.model("osrsSlayer", OsrsSlayerSchema);

export default OsrsSlayer;
