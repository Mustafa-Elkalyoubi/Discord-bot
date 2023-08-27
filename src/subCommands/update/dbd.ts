import ExtendedClient from "../../utils/Client";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner";
import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default class SubCommand extends BaseSubCommandRunner {
  constructor(baseCommand: string, group: string, name: string) {
    super(baseCommand, group, name);
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    await interaction.deferReply();
    client.getDBDData();
    interaction.editReply("DBD data updated");
  }
}