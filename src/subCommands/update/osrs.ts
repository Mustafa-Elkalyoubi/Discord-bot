import ExtendedClient from "../../utils/Client";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner";
import { ChatInputCommandInteraction } from "discord.js";

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    await interaction.deferReply();
    const result = await client.getOSRSItems();
    interaction.editReply(result ? "OSRS Items retrieved" : "Failed to update osrs items");
  }
}
