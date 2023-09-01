import BaseSubCommandRunner from "../../../utils/BaseSubCommandRunner";
import { ChatInputCommandInteraction } from "discord.js";

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async run(interaction: ChatInputCommandInteraction) {
    interaction.reply("not built yet");
  }
}
