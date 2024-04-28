import BigNumber from "bignumber.js";
import { Events, Message } from "discord.js";
import config from "../config.json";
import UserData from "../models/UserData";
import ExtendedClient from "../utils/Client";
import Modifiers from "../utils/ConsoleText";
import { beautifyNumber, calcFine, fineChannel, fineReaction } from "../utils/FineHelper";

export default {
  name: Events.MessageCreate,
  async run(message: Message, client: ExtendedClient) {
    client.messagesLogged.inc();

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
        config.dmChannel,
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

    if (!message.content.startsWith(config.prefix)) return;
    client.commandManager.runMessageCommand(message);
  },
};

async function forFun(message: Message) {
  if (message.channel.id !== fineChannel) return;

  const authorID = message.author.id;

  let user = await UserData.findOne({ userID: authorID });
  if (!user) user = new UserData({ userID: authorID });

  user.username = message.author.username;

  if (message.content.includes("🥹")) {
    const { fines } = user;
    const cap = BigNumber(fines.fineCap, 35);

    const thisFine = calcFine(BigNumber(fines.fineAmount, 35), cap);
    if (!thisFine) return message.react(fineReaction);

    if (thisFine.plus(BigNumber(fines.fineAmount, 35)).isGreaterThanOrEqualTo(cap))
      user.fines.capReached = true;

    fines.fineAmount = BigNumber(fines.fineAmount, 35).plus(thisFine).toString(35);

    user.save();

    return message.reply(
      fines.capReached
        ? `You have reached the fine limit ( ***${beautifyNumber(
            BigNumber(fines.fineCap, 35)
          )}*** ), you must post <:waaah:1016423553320628284> to pay for your crimes`
        : `Do not 🥹 (${beautifyNumber(thisFine)} fine). Your total is **${beautifyNumber(
            BigNumber(fines.fineAmount, 35)
          )}**`
    );
  }

  if (message.content.includes("<:waaah:1016423553320628284>")) {
    const user = await UserData.findOne({ userID: authorID });

    if (!user) return;
    const { fines } = user;

    if (BigNumber(fines.fineAmount).isLessThanOrEqualTo(0, 10)) return;

    // in case user changed username
    user.username = message.author.username;
    const prevFine = fines.fineAmount;

    if (fines.capReached)
      fines.fineCap = BigNumber(fines.fineCap, 35).multipliedBy(2, 10).toString(35);
    fines.fineAmount = "0";
    fines.capReached = false;

    user.save();

    return message.reply(
      `Your fines have all been paid (**${beautifyNumber(BigNumber(prevFine, 35))}**)${
        fines.capReached
          ? `, fine cap has increased to ${beautifyNumber(BigNumber(user.fines.fineCap, 35))}`
          : ``
      }`
    );
  }
}
