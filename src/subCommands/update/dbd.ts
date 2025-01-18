import { ChatInputCommandInteraction } from "discord.js";
import ExtendedClient from "../../utils/Client.js";
import SubCommand from "../../utils/command/SubCommand.js";

export default class UpdateDBD extends SubCommand {
  constructor() {
    super("dbd", true);
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    await interaction.deferReply();
    const successful = await client.dbd.updateDB();
    interaction.editReply(successful ? "DBD data updated" : "Failed to update DBD data");
  }

  getSlashCommandJSON(prev: SlashCommandBuilder): void {
    prev.addSubcommand((subcommand) =>
      subcommand.setName(this.name).setDescription("update dbd items")
    );
  }
}
