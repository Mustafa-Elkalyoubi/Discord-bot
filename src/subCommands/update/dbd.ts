import ExtendedClient from "../../utils/Client.js";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner.js";
import { ChatInputCommandInteraction } from "discord.js";

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    await interaction.deferReply();
    const successful = await client.dbd.updateDB();
    interaction.editReply(successful ? "DBD data updated" : "Failed to update DBD data");
  }
}
