import BigNumber from "bignumber.js";
import { GuildTextBasedChannel } from "discord.js";
import Misc from "../models/Misc";
import ExtendedClient from "./Client";

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

export const saveLastMessageID = async (
  client: ExtendedClient,
  reboot?: { time: number; channelID: string; messageID: string; shouldMessage: boolean }
) => {
  console.log("Saving last message...");
  const fineChannel = getFineChannel(client);
  const lastMessageID = (await fineChannel).lastMessageId!;

  let misc = await Misc.findOne();

  if (!misc) misc = new Misc();

  misc.lastMessageID = lastMessageID;
  misc.shouldUpdateItems = false;
  if (reboot) misc.reboot = reboot;

  await misc.save();
};

export const getFineChannel = (client: ExtendedClient) =>
  client.channels.fetch(fineChannel) as Promise<GuildTextBasedChannel>;
