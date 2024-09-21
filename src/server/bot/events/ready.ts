import { BigNumber } from "bignumber.js";
import { ActivityType, Events, Snowflake, TextChannel, codeBlock } from "discord.js";
import { Document } from "mongoose";
import Misc, { IMisc } from "../models/Misc.js";
import UserData from "../models/UserData.js";
import ExtendedClient from "../utils/Client.js";
import Modifiers from "../utils/ConsoleText.js";
import {
  beautifyNumber,
  calcFine,
  getFineChannel,
  getLastMessageID,
  saveMessage as saveMessageID,
} from "../utils/FineHelper.js";
import createEventHandler from "../utils/createEventHandler.js";

const ReadyHandler = createEventHandler(
  Events.ClientReady,
  async (_, client) => {
    if (!client.user) throw new Error("What? (check ready.ts)");
    client.user.setActivity(
      client.aiProcess ? "Text2Img is enabled :)" : "Text2Img is disabled :(",
      {
        type: ActivityType.Playing,
      }
    );

    console.info(
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

    const lastMessageID = await getLastMessageID();

    handleFines(client, lastMessageID);
  },
  { once: true }
);

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

async function handleFines(client: ExtendedClient, lastMessageID: Snowflake | null) {
  if (!lastMessageID) return;

  const fineChannel = await getFineChannel(client);
  const missedMessages = (await fineChannel.messages.fetch({ after: lastMessageID }))
    .filter((message) => message.content.includes("🥹") && !message.author.bot)
    .reverse();

  if (missedMessages.size < 1) return;

  const users = await UserData.find({ userID: { $in: missedMessages.map((m) => m.author.id) } });

  const finesToAddUp: {
    length: number;
    fines: { [k: string]: { amount: string; username: string } };
  } = { length: 0, fines: {} };

  missedMessages.forEach(async (message) => {
    const authorID = message.author.id;

    let user = users.find((user) => user.userID === authorID);

    if (!user) {
      user = new UserData({ userID: authorID, username: message.author.username });
      users.push(user);
    } else user.username = message.author.username;

    const thisFine = calcFine(
      BigNumber(user.fines.fineAmount, 35),
      BigNumber(user.fines.fineCap, 35)
    );

    if (!thisFine) return message.react(`855089585919098911`);

    if (
      thisFine
        .plus(BigNumber(user.fines.fineAmount, 35))
        .isGreaterThanOrEqualTo(BigNumber(user.fines.fineCap, 35))
    )
      user.fines.capReached = true;
    user.fines.fineAmount = BigNumber(user.fines.fineAmount, 35).plus(thisFine).toString(35);

    if (authorID in finesToAddUp.fines) {
      finesToAddUp.fines[authorID].amount = BigNumber(finesToAddUp.fines[authorID].amount, 35)
        .plus(thisFine)
        .toString(35);
    } else {
      finesToAddUp.fines[authorID] = {
        amount: thisFine.toString(35),
        username: message.author.username,
      };
      finesToAddUp.length++;
    }
  });

  if (finesToAddUp.length < 1) return;

  let reply;

  if (finesToAddUp.length === 1) {
    const [onlyGuyID, onlyGuyFine] = Object.entries(finesToAddUp.fines)[0];

    const onlyGuy = users.find((u) => u.userID === onlyGuyID)!;

    const amount = beautifyNumber(BigNumber(onlyGuyFine.amount, 35));
    const capReached = onlyGuy.fines.capReached;
    const fineAmount = beautifyNumber(BigNumber(onlyGuy.fines.fineAmount, 35));

    reply = await fineChannel.send(
      `You shouldnt be sending 🥹 even while I'm gone, ${
        Object.values(finesToAddUp.fines)[0].username
      }\nYou've earned ${amount} fines${
        capReached
          ? " and you've hit the cap: send <:waaah:1016423553320628284> to pay for your crimes"
          : `, your total is ${fineAmount}`
      }`
    );
  } else {
    const msgs: string[] = [];
    for (const [userID, userFine] of Object.entries(finesToAddUp.fines)) {
      const user = users.find((u) => u.id === userID)!;
      const amount = beautifyNumber(BigNumber(userFine.amount, 35));
      const capReached = user.fines.capReached;
      const fineAmount = beautifyNumber(BigNumber(user.fines.fineAmount, 35));
      msgs.push(
        `• ${userFine.username} has gotten ${amount} fines${
          capReached ? ` and has hit the cap` : `, with total ${fineAmount}`
        }`
      );
    }

    reply = await fineChannel.send(codeBlock(msgs.join("\n")));
  }

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

export default ReadyHandler;
