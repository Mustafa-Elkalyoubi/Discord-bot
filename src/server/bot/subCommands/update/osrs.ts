import ExtendedClient from "../../utils/Client.js";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner.js";
import { ChatInputCommandInteraction } from "discord.js";

class UpdateOSRSSubCommand extends BaseSubCommandRunner implements SubCommand {
  constructor(baseCommand: string, group?: string) {
    super(baseCommand, group ?? null, "osrs");
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    await interaction.deferReply();
    const result = await client.getOSRSItems();
    interaction.editReply(result ? "OSRS Items retrieved" : "Failed to update osrs items");
  }
}

export default UpdateOSRSSubCommand;
