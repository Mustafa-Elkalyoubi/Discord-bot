import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { BaseCommand } from "../utils/BaseCommand.js";

export default class Roll extends BaseCommand implements Command {
  constructor() {
    super("roll");
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Rolls a custom die (default 2)")
      .addIntegerOption((option) =>
        option.setName("sides").setDescription("How many sides should the die have").setMinValue(2)
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
