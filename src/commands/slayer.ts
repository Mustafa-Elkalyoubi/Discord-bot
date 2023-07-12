import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  codeBlock,
} from "discord.js";
import { BaseCommand } from "../utils/BaseCommand";
import fs from "node:fs";
import path from "node:path";

export default class Command extends BaseCommand {
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
    const monsterPath = path.join(__dirname, "..", "data", "slayer_monsters.json");
    const monsters: string[] = await JSON.parse(fs.readFileSync(monsterPath, "utf-8"));

    const focusedValue = interaction.options.getFocused() ?? "";
    const filtered = monsters.filter((monster) =>
      monster.toLowerCase().includes(focusedValue.toLowerCase())
    );

    if (filtered.length <= 25)
      return interaction.respond(filtered.map((monster) => ({ name: monster, value: monster })));

    interaction.respond(
      filtered.slice(0, 25).map((monster) => ({ name: monster, value: monster }))
    );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const monster = interaction.options.getString("monster")!;

    const masterPath = path.join(__dirname, "..", "data", "slayer_masters.json");
    const masters: { [k: string]: { [k: string]: number } } = await JSON.parse(
      fs.readFileSync(masterPath, "utf-8")
    );

    var valid = [];
    for (const [master, monsters] of Object.entries(masters)) {
      if (Object.keys(monsters).includes(monster))
        valid.push({
          master: master,
          weight: monsters[monster],
          total: monsters["total"],
        });
    }
    const sorted = valid.sort((b, a) => a.weight / a.total - b.weight / b.total);
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
