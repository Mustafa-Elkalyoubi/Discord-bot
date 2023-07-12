import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../utils/BaseCommand";

export default class Command extends BaseCommand {
  constructor() {
    super("roll");
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Rolls a custom die (default 2)")
      .addIntegerOption((option) =>
        option.setName("sides").setDescription("How many sides should the die have")
      )
      .toJSON();
  }

  run(interaction: ChatInputCommandInteraction) {
    const input = interaction.options.getInteger("sides") ?? 2;

    const rollDice = (min: number, max: number) => {
      return min + Math.floor(Math.random() * (max - min + 1));
    };

    const roll = rollDice(1, input);
    return interaction.reply({
      content: `Rolled a ${roll}`,
    });
  }
}
