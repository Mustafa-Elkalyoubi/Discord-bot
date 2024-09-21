import { Message } from "discord.js";
import { DateTime } from "luxon";

const TimeConvertCommand: MessageCommand = {
  conf: {
    aliases: ["tc"],
    permLevel: 0,
  },

  help: {
    name: "timeConvert",
    description: "convert h m s to ms",
    usage: "~tc h m s",
  },

  run: (message: Message, args: string[]) => {
    let hours, mins, seconds;

    if (args.length > 4)
      [hours, mins, seconds] = [parseInt(args[0]), parseInt(args[2]), parseInt(args[4])];
    else [hours, mins, seconds] = [0, parseInt(args[0]), parseInt(args[2])];

    if (isNaN(hours) || isNaN(mins) || isNaN(seconds))
      return message.reply("just copy paste from the message");

    const thing = DateTime.now().plus({
      hours: hours,
      minutes: mins,
      seconds: seconds,
    });

    if (message.channel.isSendable())
      message.channel.send(`\\<t:${thing.toSeconds().toFixed(0).toString()}:R>`);
  },
};

export default TimeConvertCommand;
