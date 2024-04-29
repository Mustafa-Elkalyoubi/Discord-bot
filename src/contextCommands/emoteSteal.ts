import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  RESTJSONErrorCodes,
  MessageContextMenuCommandInteraction,
} from "discord.js";
import { BaseCommand } from "../utils/BaseCommand.js";
import { steal7TV } from "../utils/steal7tv.js";

export default class Command extends BaseCommand {
  constructor() {
    super("Emoji Steal");
  }

  getContextCommandJSON() {
    return new ContextMenuCommandBuilder()
      .setName(this.name)
      .setType(ApplicationCommandType.Message)
      .toJSON();
  }

  async run(interaction: MessageContextMenuCommandInteraction) {
    const message = await interaction.channel?.messages.fetch(interaction.targetId);

    if (!message) return interaction.reply("Couldnt find message with id " + interaction.targetId);
    if (!interaction.guild) return interaction.reply(`You want me to add this emoji in a dm????`);

    if (message?.content.includes("7tv.app")) {
      await interaction.deferReply();
      return steal7TV(interaction, message.content, "");
    }

    const emojiRegex = /<:\w+:\d+>/i;
    const animatedRegex = /<a:\w+:\d+>/i;

    const emojiRes = emojiRegex.exec(message.content) ?? animatedRegex.exec(message.content);
    if (!emojiRes)
      return interaction.reply({
        content: `Could not find stealable emoji in message`,
        ephemeral: true,
      });

    await interaction.deferReply();

    const str = emojiRes[0].replace("<", "").replace(">", "").split(":");
    const name = str[1];
    const id = str[2];
    const url = `https://cdn.discordapp.com/emojis/${id}.${str[0] === "a" ? "gif" : "png"}`;
    return interaction.guild.emojis
      .create({ attachment: url, name: name })
      .then((emoji) =>
        interaction.editReply({
          content: `Emoji added: <${str[0]}:${emoji.name}:${emoji.id}>`,
        })
      )
      .catch((err) => {
        if (err.code === RESTJSONErrorCodes.MaximumNumberOfEmojisReached)
          return interaction.editReply({
            content: `Maximum number of emojis reached`,
          });
        console.error(err);
        console.log(str, name, id, url);
        interaction.editReply({
          content: `Error creating emoji: ${err.message}`,
        });
      });
  }
}
