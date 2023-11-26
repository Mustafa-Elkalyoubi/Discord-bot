import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { BaseCommand } from "../utils/BaseCommand";

enum multipliers {
  melee = 35,
  other = 32,
  prayer = 18,
}

const calcXPGainedPerPoint = (level: number, type: keyof typeof multipliers) =>
  Math.floor(level ** 2 / 600) * multipliers[type] +
  (Math.floor(level ** 2 / 600) * multipliers[type] * 1) / 10;

const calcXpAtLevel = (level: number) =>
  (1 / 8) * (level ** 2 - level + 600 * ((2 ** (level / 7) - 2 ** (1 / 7)) / (2 ** (1 / 7) - 1)));

const calcPointsUntilMax = (level: number, type: keyof typeof multipliers, multiplier: number) => {
  let pointsNeeded = 0;

  while (level !== 99) {
    const xpNeeded = calcXpAtLevel(level + 1) - calcXpAtLevel(level);
    const xpPerPoint = calcXPGainedPerPoint(level, type) * multiplier;

    let xpGained = 0;
    while (xpGained < xpNeeded) {
      pointsNeeded += 1;
      xpGained += xpPerPoint;
    }

    level += 1;
  }

  return pointsNeeded;
};

export default class Command extends BaseCommand {
  constructor() {
    super("pestcontrol", false);
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Calculate the number of points needed to max combat!")
      .addNumberOption((option) =>
        option
          .setName("multiplier")
          .setDescription("Your current XP Multiplier")
          .setRequired(true)
          .setChoices(
            ...[
              { name: "5x", value: 5 },
              { name: "8x", value: 8 },
              { name: "12x", value: 12 },
              { name: "16x", value: 16 },
            ]
          )
      )
      .addNumberOption((option) =>
        option
          .setName("attack")
          .setDescription("your current attack level")
          .setMaxValue(99)
          .setMinValue(25)
      )
      .addNumberOption((option) =>
        option
          .setName("strength")
          .setDescription("your current strength level")
          .setMaxValue(99)
          .setMinValue(25)
      )
      .addNumberOption((option) =>
        option
          .setName("defence")
          .setDescription("your current defence level")
          .setMaxValue(99)
          .setMinValue(25)
      )
      .addNumberOption((option) =>
        option
          .setName("range")
          .setDescription("your current range level")
          .setMaxValue(99)
          .setMinValue(25)
      )
      .addNumberOption((option) =>
        option
          .setName("mage")
          .setDescription("your current mage level")
          .setMaxValue(99)
          .setMinValue(25)
      )
      .addNumberOption((option) =>
        option
          .setName("prayer")
          .setDescription("your current prayer level")
          .setMaxValue(99)
          .setMinValue(25)
      )
      .addNumberOption((option) => option.setName("ppp").setDescription("points per run lol"))
      .toJSON();
  }

  async run(interaction: ChatInputCommandInteraction) {
    const xpMultiplier = interaction.options.getNumber("multiplier")!;
    const attack = interaction.options.getNumber("attack") ?? 99;
    const strength = interaction.options.getNumber("strength") ?? 99;
    const defence = interaction.options.getNumber("defence") ?? 99;
    const range = interaction.options.getNumber("range") ?? 99;
    const mage = interaction.options.getNumber("mage") ?? 99;
    const prayer = interaction.options.getNumber("prayer") ?? 99;
    const ppp = interaction.options.getNumber("ppp") ?? 56;

    let pointsNeeded = 0;

    pointsNeeded += calcPointsUntilMax(attack, "melee", xpMultiplier);
    pointsNeeded += calcPointsUntilMax(strength, "melee", xpMultiplier);
    pointsNeeded += calcPointsUntilMax(defence, "melee", xpMultiplier);
    pointsNeeded += calcPointsUntilMax(range, "other", xpMultiplier);
    pointsNeeded += calcPointsUntilMax(mage, "other", xpMultiplier);
    pointsNeeded += calcPointsUntilMax(prayer, "prayer", xpMultiplier);

    interaction.reply(
      `You need ${roundNearest100(pointsNeeded)} to get 99 in all combats, or ${Math.ceil(
        pointsNeeded / ppp
      )} runs`
    );
  }
}

function roundNearest100(num: number) {
  return Math.round(num / 100) * 100;
}
