import { BigNumber } from "bignumber.js";
import { GuildTextBasedChannel, Message } from "discord.js";
import fs from "node:fs/promises";
import ExtendedClient from "./Client.js";
import path from "node:path";

export const fineChannel = "852270452142899213"; // kiwi
// export const fineChannel = "515209238566404116"; // dev
export const fineReaction = "855089585919098911";

export const beautifyNumber = (number: BigNumber) => {
  return number.toFormat({ groupSeparator: ",", groupSize: 3 });
};

export const calcFine = (current: BigNumber, cap: BigNumber) => {
  if (current.isGreaterThanOrEqualTo(cap)) {
    // message.react(`855089585919098911`);
    return null;
  }

  console.log(current, cap);

  let percentageOfCap = cap
    .minus(1_000_000_000, 10)
    .multipliedBy((0.2 - 0.1) / (5_000 - 1_000_000_000), 10)
    .plus(0.1, 10);

  // Percentage of max is 20% - 10%
  if (percentageOfCap.isLessThan(0.1, 10)) percentageOfCap = BigNumber(0.1, 10);

  // Random for cap between max % of cap and 3.5% of the cap
  const randomAmount = cap
    .multipliedBy(percentageOfCap, 10)
    .multipliedBy(Math.random(), 10)
    .plus(cap.multipliedBy(0.035), 10)
    .decimalPlaces(0);

  return randomAmount.plus(current).isGreaterThanOrEqualTo(cap) ? cap.minus(current) : randomAmount;
};

const __dirname = (() => {
  const x = path.dirname(decodeURI(new URL(import.meta.url).pathname));
  return path.resolve(process.platform == "win32" ? x.substr(1) : x);
})();
const lastMessageFilePath = path.join(__dirname, "..", "data", "lastMessage.txt");

export const saveMessage = async (message: Message) => {
  return fs
    .writeFile(lastMessageFilePath, message.id, { encoding: "utf-8", flag: "w" })
    .catch((e) => console.error(`Failed to save message\n`, e));
};

export const getLastMessageID = async () => {
  return fs.readFile(lastMessageFilePath, { encoding: "utf-8" }).catch(() => null);
};

export const getFineChannel = (client: ExtendedClient) =>
  client.channels.fetch(fineChannel) as Promise<GuildTextBasedChannel>;
