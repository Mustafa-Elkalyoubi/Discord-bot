import SubCommand from "../../utils/command/SubCommand.js";

class UserInfo extends SubCommand {
  constructor() {
    super("user", true);
  }

  getSlashCommandJSON(prev: SlashCommandBuilder): void {
    prev.addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("Get a user's information")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("Select a user (empty for yourself)")
            .setRequired(false)
        )
    );
  }

  // TODO: Implement this lol
  run(): unknown {
    throw new Error("Not implemented");
  }
}

export default UserInfo;
