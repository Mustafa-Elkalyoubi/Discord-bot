import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import TextCommand from "../utils/command/TextCommand.js";

export default class FixBankLayout extends TextCommand {
  constructor() {
    super("fixbanklayout", true);
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Converts from bank tag layouts to built in layout")
      .addStringOption((option) =>
        option.setName("input").setDescription("Exported bank tag layout string").setRequired(true)
      )
      .toJSON();
  }

  async run(interaction: ChatInputCommandInteraction) {
    const input = interaction.options.getString("input", true);
    let output = "banktags,1,";

    const layout: string[] = [];

    const split = input.split(",");

    const [, name] = split[0].split(":");
    output += name + ",";

    let i = 0;
    let curr = "";
    while (!curr.includes("banktag")) {
      curr = split[++i];
      layout.push(curr.split(":").reverse().toString());
    }

    const idkWhatThisIs = split.slice(i + 1, split.length);

    layout.splice(layout.length - 1, 1);

    const layoutStr = ",layout," + layout.toString();

    interaction.reply(output + idkWhatThisIs.toString() + layoutStr);
  }
}
