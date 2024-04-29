import BaseSlashSubCommand from "../../utils/BaseSlashSubCommand.js";
import BaseSubCommandRunner from "../../utils/BaseSubCommandRunner.js";
import { EmbedBuilder, ChatInputCommandInteraction } from "discord.js";

type SubCommandGroup = {
  name: string;
  subcommands: Array<string>;
};

export default class SubCommand extends BaseSubCommandRunner {
  constructor(
    baseCommand: BaseSlashSubCommand,
    group: Array<SubCommandGroup | null>,
    name: string
  ) {
    super(baseCommand, group, name);
  }

  async run(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) return interaction.reply("This command can only be used in a server");
    const owner = await interaction.guild?.fetchOwner();
    const roleStrings = divideRoles(interaction);
    const serverEmbed = new EmbedBuilder()
      .setColor("Random")
      .setAuthor({
        name: interaction.user.username,
        iconURL: interaction.user.displayAvatarURL(),
        url: interaction.user.displayAvatarURL(),
      })
      .setTitle(interaction.guild.name)
      .addFields(
        { name: "Owner", value: owner.user.toString(), inline: true },
        { name: "Member Count", value: interaction.guild.memberCount.toString(), inline: true },
        { name: "Created At", value: interaction.guild.createdAt.toString(), inline: true },
        {
          name: "Channels",
          value: interaction.guild.channels.cache.map((c) => c.toString()).join(", "),
        }
      )
      .addFields(
        roleStrings.map((str, index) => {
          return { name: `Roles #${index + 1}`, value: str };
        })
      )
      .setTimestamp();
    if (interaction.guild.iconURL())
      serverEmbed.setURL(interaction.guild.iconURL()).setImage(interaction.guild.iconURL());

    return interaction.reply({ embeds: [serverEmbed] });
  }
}

function divideRoles(interaction: ChatInputCommandInteraction) {
  const roles: Array<string> = [];
  let division = 0;
  const strings = [];
  interaction.guild?.roles.cache.map((role) => {
    roles.push(`<@&${role.id}>`);
  });

  strings[0] = "";
  for (const role of roles) {
    if (strings[division].length >= 1000) {
      division++;
      strings[division] = "";
    }
    strings[division] += role;
  }

  return strings;
}
