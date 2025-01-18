import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import TextCommand from "../utils/command/TextCommand.js";

export default class WHTR extends TextCommand {
  constructor() {
    super("whohasthisrole", false);
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Looks for users that have that one role")
      .addRoleOption((option) =>
        option.setName("role").setDescription("that one role").setRequired(true)
      )
      .toJSON();
  }

  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild)
      return interaction.reply({ content: "Do this in a server", ephemeral: true });

    const thatOneRole = interaction.options.getRole("role")!;
    const members = await interaction.guild.members.fetch();
    const membersWithThatRole = members
      .filter((member) => member.roles.cache.has(thatOneRole.id))
      .toJSON();

    if (membersWithThatRole.length < 1) return interaction.reply(`No one has ${thatOneRole}`);

    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setColor(thatOneRole.color)
      .setTimestamp()
      .setTitle(`People with ${thatOneRole.name}`)
      .setDescription(`${membersWithThatRole.join(" ")}`);

    interaction.reply({ embeds: [embed] });
  }
}
