import { ChatInputCommandInteraction } from "discord.js";
import ExtendedClient from "../../utils/Client.js";
import SubCommand from "../../utils/command/SubCommand.js";

export default class UpdateOSRS extends SubCommand {
  constructor() {
    super("osrs", true);
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    await interaction.deferReply();
    const result = await client.getOSRSItems();
    interaction.editReply(result ? "OSRS Items retrieved" : "Failed to update osrs items");
  }

  getSlashCommandJSON(prev: SlashCommandBuilder): void {
    prev.addSubcommand((subcommand) =>
      subcommand.setName(this.name).setDescription("update osrs items")
    );
  }
}
