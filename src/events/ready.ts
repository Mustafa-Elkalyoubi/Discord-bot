import { BigNumber } from "bignumber.js";
import { ActivityType, Events, Message, TextChannel, codeBlock } from "discord.js";
import { Document } from "mongoose";
import Misc, { IMisc } from "../models/Misc.js";
import UserData from "../models/UserData.js";
import ExtendedClient from "../utils/Client.js";
import Modifiers from "../utils/ConsoleText.js";
import {
  beautifyNumber,
  calcFine,
  calcNewCap,
  fineReaction,
  getFineChannel,
  getLastMessageID,
  isBadMessage,
  isGoodMessage,
  saveMessage as saveMessageID,
} from "../utils/FineHelper.js";

export default {
  name: Events.ClientReady,
  once: true,
  run: async (client: ExtendedClient) => {
    if (!client.user) throw "What? (check ready.ts)";
    client.user.setActivity(
      client.aiProcess ? "Text2Img is enabled :)" : "Text2Img is disabled :(",
      { type: ActivityType.Playing }
    );

    console.log(
      `${Modifiers.LIGHT_BLUE}Ready, logged in as ${client.user.tag + Modifiers.DEFAULT}`
    );

    const misc = await Misc.findOne();
    if (!misc) {
      new Misc({
        shouldUpdateItems: false,
        reboot: {
          time: Date.now(),
          channelID: "",
          messageID: "",
          shouldMessage: false,
        },
      }).save();

      return;
    }

    if (misc.reboot && misc.reboot.shouldMessage) await editRebootMessage(misc, client);

    handleFines(client);
  },
};

async function editRebootMessage(
  misc: Document<unknown, object, IMisc> & IMisc,
  client: ExtendedClient
) {
  const { messageID, channelID, time } = misc.reboot;

  const timeDiff = ((Date.now() - time) / 1000).toLocaleString("en-US", { notation: "compact" });

  const channel = (await client.channels.fetch(channelID)) as TextChannel;
  const messageObj = await channel.messages.fetch(messageID);

  if (messageObj.editable)
    await messageObj.edit(`Reboot complete! Reboot took ${timeDiff} seconds`);

  misc.reboot.shouldMessage = false;
  misc.save();
}

async function handleFines(client: ExtendedClient) {
  let lastMessageID = await getLastMessageID();

  if (!lastMessageID) {
    const fineChannel = await getFineChannel(client);
    const lastMessage = fineChannel.lastMessage;

    if (!lastMessage) return;
    lastMessageID = lastMessage.id;
    saveMessageID(lastMessage);
  }

  if (!lastMessageID) return;

  const fineChannel = await getFineChannel(client);
  const missedMessages = (await fineChannel.messages.fetch({ after: lastMessageID }))
    .filter((message) => (isGoodMessage(message) || isBadMessage(message)) && !message.author.bot)
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  if (missedMessages.size < 1) return;

  const groupedMessages = missedMessages.reduce<[string, Message<true>[]][]>((acc, curr) => {
    const added = acc.find(([key]) => key === curr.author.id);
    if (added) added[1].push(curr);
    else acc.push([curr.author.id, [curr]]);

    return acc;
  }, []);

  const users = await UserData.find({
    userID: { $in: missedMessages.map((msg) => msg.author.id) },
  });

  type Tracked = { accumulatedFines: BigNumber; capIncreases: number };
  const tracker = new Map<string, Tracked>(
    users.map((u) => [u.userID, { accumulatedFines: BigNumber(0), capIncreases: 0 }])
  );

  groupedMessages.forEach(async ([userID, messages]) => {
    let user = users.find((user) => user.userID === userID);

    if (!user) {
      user = new UserData({ userID, username: messages[0].author.username });
      users.push(user);
    } else user.username = messages[0].author.username;

    let currentFine = BigNumber(user.fines.fineAmount, 35);
    let capReached = user.fines.capReached;
    let cap = BigNumber(user.fines.fineCap, 35);

    messages.forEach((message) => {
      if (isGoodMessage(message)) {
        if (currentFine.isLessThanOrEqualTo(0, 10)) return;

        if (capReached) {
          cap = calcNewCap(cap);
          tracker.get(userID)!.capIncreases++;
        }

        currentFine = BigNumber(0, 35);
        capReached = false;
      } else if (isBadMessage(message)) {
        const thisFine = calcFine(currentFine, cap);

        if (!thisFine) return message.react(fineReaction);
        tracker.get(userID)!.accumulatedFines = tracker
          .get(userID)!
          .accumulatedFines.plus(thisFine);

        currentFine = thisFine.plus(currentFine);
        if (currentFine.isGreaterThanOrEqualTo(cap)) capReached = true;
      }
    });

    user.fines.fineAmount = currentFine.toString(35);
    user.fines.capReached = capReached;
    user.fines.fineCap = cap.toString(35);
  });

  const msgs: string[] = [];
  for (const [userID, trackedData] of tracker.entries()) {
    if (trackedData.accumulatedFines.isEqualTo(0) || trackedData.capIncreases === 0) continue;

    const user = users.find((u) => u.userID === userID)!;
    const amount = beautifyNumber(trackedData.accumulatedFines);

    msgs.push(
      `• ${user.username} has gotten ${amount} fines${
        trackedData.capIncreases > 1 ? ` and ${trackedData.capIncreases} cap increases` : ""
      }`
    );
  }

  const reply = await fineChannel.send(codeBlock(msgs.join("\n")));

  saveMessageID(reply);

  await UserData.bulkWrite(
    users.map((u) => ({
      updateOne: {
        filter: { _id: u._id, userID: u.userID },
        update: u.toObject(),
        upsert: true,
      },
    }))
  );
}
