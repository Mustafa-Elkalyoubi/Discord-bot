import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import BaseCommand from "../utils/BaseCommand.js";
import ExtendedClient from "../utils/Client.js";

export default class FindSteamGame extends BaseCommand implements Command {
  constructor() {
    super("findsteamgame", true);
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Get a steam app id by its name")
      .addStringOption((option) => {
        option
          .setName("name")
          .setDescription("The name of the game")
          .setRequired(true)
          .setAutocomplete(true);

        return option;
      })
      .toJSON();
  }

  async autocomplete(interaction: AutocompleteInteraction, client: ExtendedClient) {
    const focusedValue = interaction.options.getFocused() ?? "";

    if (!focusedValue) return [];

    const steamApps = await client.steam.findAppByName(focusedValue, 25);

    const apps = steamApps.map((app) => ({
      name: app.name.length >= 100 ? app.name.substring(0, 96) + "..." : app.name,
      value: app.appID.toString(),
    }));

    return interaction.respond(apps);
  }

  async run(interaction: ChatInputCommandInteraction) {
    const input = interaction.options.getString("name", true);

    return interaction.reply({
      content: `https://store.steampowered.com/app/${input}/`,
    });
  }
}
