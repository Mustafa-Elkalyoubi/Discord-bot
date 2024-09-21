import ExtendedClient from "../../utils/Client.js";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner.js";
import { ChatInputCommandInteraction } from "discord.js";

class UpdateDBDSubCommand extends BaseSubCommandRunner implements SubCommand {
  constructor(baseCommand: string, group?: string) {
    super(baseCommand, group ?? null, "dbd");
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    await interaction.deferReply();
    const successful = await client.dbd.updateDB();
    interaction.editReply(successful ? "DBD data updated" : "Failed to update DBD data");
  }
}

export default UpdateDBDSubCommand;
