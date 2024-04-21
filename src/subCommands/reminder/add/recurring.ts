import BaseSubCommandRunner from "../../../utils/BaseSubCommandRunner";
import { ChatInputCommandInteraction } from "discord.js";

enum Recurring {
  sun = 0,
  mon = 1,
  tue = 2,
  wed = 3,
  thur = 4,
  fri = 5,
  sat = 6,
}

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async run(interaction: ChatInputCommandInteraction) {
    interaction.reply("not built yet");
  }
}
