import {
  ChatInputCommandInteraction,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  codeBlock,
  ButtonInteraction,
  ComponentType,
} from "discord.js";
import { BaseCommand } from "../utils/BaseCommand.js";

export default class Oull extends BaseCommand implements Command {
  constructor() {
    super("oull");
  }

  requiems = ["Unknown", "Fass", "Jahu", "Khra", "Lohk", "Netra", "Ris", "Vome", "Xata"];

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Given known mods, find the best combination to use")
      .addIntegerOption((option) =>
        option
          .setRequired(true)
          .addChoices(
            ...this.requiems.map((v, i) => {
              return { name: v, value: i };
            })
          )
          .setName("a")
          .setDescription("The first known requiem mod")
      )
      .addIntegerOption((option) =>
        option
          .setRequired(true)
          .addChoices(
            ...this.requiems.map((v, i) => {
              return { name: v, value: i };
            })
          )
          .setName("b")
          .setDescription("The second known requiem mod")
      )
      .toJSON();
  }

  async run(interaction: ChatInputCommandInteraction) {
    enum eReq {
      Unknown,
      Fass,
      Jahu,
      Khra,
      Lohk,
      Netra,
      Ris,
      Vome,
      Xata,
    }
    let a: eReq = interaction.options.getInteger("a")!;
    let b: eReq = interaction.options.getInteger("b")!;

    if (a === eReq.Unknown && b === eReq.Unknown)
      return interaction.reply(
        codeBlock(
          "md",
          "• Do not stab until the first is unveiled. Then place the mods in this order: \nOull, Unveiled, Random"
        )
      );

    if (a === eReq.Unknown && b !== eReq.Unknown) [a, b] = [b, a];

    if (a !== eReq.Unknown && b === eReq.Unknown) {
      return interaction.reply(
        codeBlock(
          "md",
          `• Stab your lich with this combination: Oull, ${this.requiems[a]}, Random.\n• Do not stab until second is revealed`
        )
      );
    }

    await interaction.reply({
      content: `Was **${this.requiems[a]}** correct in position 2?`,
      components: [
        // @ts-expect-error works but not allowed for some reason
        new ActionRowBuilder().setComponents(
          new ButtonBuilder().setCustomId("aTwo").setLabel("Yes").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("aNotTwo").setLabel("No").setStyle(ButtonStyle.Danger)
        ),
      ],
    });

    const filter = (btnInteraction: ButtonInteraction) => {
      return interaction.user.id === btnInteraction.user.id;
    };

    const collector = interaction.channel!.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: filter,
      max: 20,
      time: 1000 * 90,
    });

    collector.on("collect", async (btn: ButtonInteraction) => {
      if (btn.customId === "aTwo") {
        await btn.update({
          content: codeBlock(
            "md",
            `• Stab your lich with this order: Oull, ${this.requiems[a]}, ${this.requiems[b]}\n• If it was wrong: ${this.requiems[b]}, ${this.requiems[a]}, Oull\n• Done!`
          ),
          components: [],
        });
        collector.stop();
      }

      if (btn.customId === "aNotTwo") {
        await btn.update({
          content: codeBlock(
            "md",
            `Use this order: \nOull, ${this.requiems[b]}, ${this.requiems[a]}`
          ),
          components: [
            // @ts-expect-error works but not allowed for some reason
            new ActionRowBuilder().setComponents(
              new ButtonBuilder()
                .setCustomId("b2W")
                .setLabel("2 is wrong")
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId("a3W")
                .setLabel("3 is wrong")
                .setStyle(ButtonStyle.Success)
            ),
          ],
        });
      }

      if (btn.customId === "b2W")
        await btn.update({
          content: codeBlock(
            "md",
            `Ouch. Use this order: \n${this.requiems[b]}, Oull, ${this.requiems[a]}`
          ),
          components: [
            // @ts-expect-error works but not allowed for some reason
            new ActionRowBuilder().setComponents(
              new ButtonBuilder()
                .setCustomId("b1W")
                .setLabel("1 is wrong")
                .setStyle(ButtonStyle.Primary)
            ),
          ],
        });

      if (btn.customId === "a3W") {
        await btn.update({
          content: codeBlock(
            "md",
            `• Use this order: ${this.requiems[a]}, ${this.requiems[b]}, Oull\n• Done!`
          ),
          components: [],
        });

        collector.stop();
      }

      if (btn.customId === "b1W") {
        await btn.update({
          content: codeBlock(
            "md",
            `You got the most unlucky order lol:\n${this.requiems[a]}, Oull, ${this.requiems[b]}`
          ),
          components: [],
        });
        collector.stop();
      }
    });

    collector.on("end", () => {
      interaction.editReply({ components: [] });
    });
  }
}
