import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { BaseCommand } from "../utils/BaseCommand.js";

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

export default class PestControl extends BaseCommand implements Command {
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
      .addNumberOption((option) => option.setName("points").setDescription("your current points"))
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
          .setName("hitpoints")
          .setDescription("your current hitpoints level")
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
    const hp = interaction.options.getNumber("hitpoints") ?? 99;
    const range = interaction.options.getNumber("range") ?? 99;
    const mage = interaction.options.getNumber("mage") ?? 99;
    const prayer = interaction.options.getNumber("prayer") ?? 99;
    const points = interaction.options.getNumber("points") ?? 0;
    const ppp = interaction.options.getNumber("ppp") ?? 56;

    const attackPoints = calcPointsUntilMax(attack, "melee", xpMultiplier);
    const strengthPoints = calcPointsUntilMax(strength, "melee", xpMultiplier);
    const defencePoints = calcPointsUntilMax(defence, "melee", xpMultiplier);
    const hpPoints = calcPointsUntilMax(hp, "melee", xpMultiplier);
    const rangePoints = calcPointsUntilMax(range, "other", xpMultiplier);
    const magePoints = calcPointsUntilMax(mage, "other", xpMultiplier);
    const prayerPoints = calcPointsUntilMax(prayer, "prayer", xpMultiplier);

    const totalPoints =
      attackPoints +
      strengthPoints +
      defencePoints +
      hpPoints +
      rangePoints +
      magePoints +
      prayerPoints;

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTimestamp()
      .setTitle("[Leagues] Pest Control points needed")
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setFooter({ text: "gl" })
      .setDescription(
        `You need **${roundNearest100(totalPoints) - points}** points${
          points !== 0 ? ` **(${roundNearest100(totalPoints)} total)**` : ""
        } to get 99 in all combats, or **${Math.ceil((totalPoints - points) / ppp)}** runs`
      )
      .addFields(
        { name: "Hitpoints", value: `Level: ${hp}, Points needed: **${hpPoints}**` },
        { name: "Attack", value: `Level: ${attack}, Points needed: **${attackPoints}**` },
        { name: "Strength", value: `Level: ${strength}, Points needed: **${strength}**` },
        { name: "Defence", value: `Level: ${defence}, Points needed: **${defencePoints}**` },
        { name: "Range", value: `Level: ${range}, Points needed: **${rangePoints}**` },
        { name: "Mage", value: `Level: ${mage}, Points needed: **${magePoints}**` },
        { name: "Prayer", value: `Level: ${prayer}, Points needed: **${prayerPoints}**` }
      );

    interaction.reply({ embeds: [embed] });
  }
}

function roundNearest100(num: number) {
  return Math.ceil(num / 100) * 100;
}
