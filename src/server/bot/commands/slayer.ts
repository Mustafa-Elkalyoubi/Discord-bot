import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  codeBlock,
} from "discord.js";
import OsrsSlayer from "../models/OsrsSlayer.js";
import BaseCommand from "../utils/BaseCommand.js";

export default class Slayer extends BaseCommand implements Command {
  constructor() {
    super("slayer");
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Find the best slayer master for a task")
      .addStringOption((option) => {
        option
          .setName("monster")
          .setDescription("The name of the monster")
          .setRequired(true)
          .setAutocomplete(true);

        return option;
      })
      .toJSON();
  }

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused() ?? "";

    const monsterNames = await OsrsSlayer.aggregate([
      {
        $project: {
          item: 1,
          monsters: {
            $objectToArray: "$monsters",
          },
        },
      },
      {
        $unwind: "$monsters",
      },
      {
        $group: {
          _id: null,
          monsters: {
            $addToSet: "$monsters.k",
          },
        },
      },
      {
        $unwind: "$monsters",
      },
      {
        $sort: {
          monsters: 1,
        },
      },
      ...(focusedValue
        ? [
            {
              $match: {
                monsters: {
                  $regex: focusedValue,
                  $options: "i",
                },
              },
            },
          ]
        : []),
      {
        $limit: 25,
      },
      {
        $group: {
          _id: null,
          monsters: {
            $push: "$monsters",
          },
        },
      },
    ]);

    return interaction.respond(
      monsterNames[0].monsters.map((monster: string) => ({ name: monster, value: monster }))
    );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const monster = interaction.options.getString("monster")!;

    const prop = `monsters.${monster}`;
    const masters = (await OsrsSlayer.find({ [prop]: { $exists: true } })).map((m) => ({
      ...m.toObject(),
      weight: m.monsters.get(monster)!,
      total: m.total,
    }));

    const sorted = masters.sort((b, a) => a.weight / a.total - b.weight / b.total);
    return interaction.reply(
      codeBlock(
        "js",
        `MONSTER: ${monster}\n${sorted
          .map(
            (master) => `${master.master}: ${((master.weight / master.total) * 100).toFixed(2)}%`
          )
          .join("\n")}`
      )
    );
  }
}
