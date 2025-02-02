import { BigNumber } from "bignumber.js";
import { Events, Message } from "discord.js";
import UserData from "../models/UserData.js";
import ExtendedClient from "../utils/Client.js";
import Modifiers from "../utils/ConsoleText.js";
import {
  beautifyNumber,
  calcFine,
  calcNewCap,
  fineChannel,
  fineReaction,
  isBadMessage,
  isGoodMessage,
  saveMessage,
} from "../utils/FineHelper.js";

export default {
  name: Events.MessageCreate,
  async run(message: Message, client: ExtendedClient) {
    const { DM_CHANNEL, PREFIX } = process.env;
    client.messagesLogged.inc(1);

    const attachments = message.attachments;

    const log = client.log;

    if (message.author.bot) {
      if (message.channel.isDMBased()) return;
      if (message.author.id === client.user?.id) return;
      if (message.guild)
        return log(
          message.guild.name,
          `BOT ${Modifiers.CYAN}${message.author.username}: ${Modifiers.DEFAULT}${message.content}`
        );
    }

    await forFun(message);

    if (message.channel.isDMBased() || !message.guild) {
      log(
        `DM`,
        `${Modifiers.YELLOW}${message.author.username}: ${Modifiers.DEFAULT}${message.content} ${
          attachments.size > 0 ? `|| File: ${attachments.map((c) => c.url)}` : ""
        }`
      );
      client.sendToChannel(
        DM_CHANNEL!,
        `${message.author.username} (${message.author.id}): ${message.content} ${
          message.attachments.size > 0 ? `|| File: ${message.attachments.map((c) => c.url)}` : ""
        }`
      );
    } else {
      log(
        `${message.guild.name}`,
        `${Modifiers.CYAN}${message.author.username}: ${Modifiers.DEFAULT}${message.content}${
          attachments.size > 0 ? `|| File: ${attachments.map((c) => c.url)}` : ""
        }`
      );
    }

    if (!message.content.startsWith(PREFIX)) return;
    client.commandManager.runMessageCommand(message);
  },
};

async function forFun(message: Message) {
  if (message.channel.id !== fineChannel) return;

  saveMessage(message);

  if (!message.content.includes("🥹") && !message.content.includes("<:waaah:1016423553320628284>"))
    return;

  const authorID = message.author.id;

  let user = await UserData.findOne({ userID: authorID });
  if (!user) user = new UserData({ userID: authorID });

  const { fines } = user;
  user.username = message.author.username;

  const currentFine = BigNumber(fines.fineAmount, 35);
  const cap = BigNumber(fines.fineCap, 35);

  if (isBadMessage(message)) {
    const thisFine = calcFine(currentFine, cap);
    if (!thisFine) return message.react(fineReaction);

    if (thisFine.plus(currentFine).isGreaterThanOrEqualTo(cap)) user.fines.capReached = true;

    fines.fineAmount = currentFine.plus(thisFine).toString(35);

    user.save();

    return message.reply(
      fines.capReached
        ? `You have reached the fine limit ( ***${beautifyNumber(
            BigNumber(fines.fineCap, 35)
          )}*** ), you must post <:waaah:1016423553320628284> to pay for your crimes`
        : `Do not 🥹 (${beautifyNumber(thisFine)} fine). Your total is **${beautifyNumber(
            currentFine
          )}**`
    );
  }

  if (isGoodMessage(message)) {
    const { fines } = user;

    if (BigNumber(fines.fineAmount).isLessThanOrEqualTo(0, 10)) return;

    // in case user changed username
    user.username = message.author.username;
    const prevFine = fines.fineAmount;
    const capReachedCopy = fines.capReached;

    if (fines.capReached) fines.fineCap = calcNewCap(cap).toString(35);
    fines.fineAmount = "0";
    fines.capReached = false;

    user.save();

    return message.reply(
      `Your fines have all been paid (**${beautifyNumber(BigNumber(prevFine, 35))}**)${
        capReachedCopy
          ? `, fine cap has increased to ${beautifyNumber(BigNumber(user.fines.fineCap, 35))}`
          : ``
      }`
    );
  }
}
