import { Message } from "discord.js";
import Misc from "../models/Misc.js";
import { spawn } from "child_process";

const RebootCommand: MessageCommand = {
  conf: {
    aliases: ["restart"],
    permLevel: 4,
  },

  help: {
    name: "reboot",
    description: "Restarts bot and indicates the reboot time.",
    usage: "reboot",
  },

  run: async (message: Message) => {
    const msg = await message.reply("Rebooting...");

    let misc = await Misc.findOne();

    if (!misc)
      misc = new Misc({
        reboot: {
          time: Date.now(),
          channelID: msg.channel.id,
          messageID: msg.id,
          shouldMessage: true,
        },
        shouldUpdateItems: false,
      });

    const subprocess = spawn(process.argv[1], process.argv.slice(2), {
      detached: true,
      stdio: ["ignore", process.stdout, process.stderr],
    });

    subprocess.unref();

    process.exit(1);
  },
};

export default RebootCommand;
