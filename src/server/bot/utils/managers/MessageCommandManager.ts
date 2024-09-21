import DataCollector from "@/server/DataCollector/DataCollector";
import { Collection, Message, PermissionsBitField } from "discord.js";

class MessageCommandManager {
  #client: ExtendedClient;
  #ownerID: string;
  #collector: DataCollector;

  #messageCommands: Collection<string, MessageCommand>;
  #aliases: Collection<string, MessageCommand>;

  constructor(client: ExtendedClient, ownerID: string, collector: DataCollector) {
    this.#client = client;
    this.#messageCommands = new Collection();
    this.#aliases = new Collection();

    this.#ownerID = ownerID;
    this.#collector = collector;
  }

  #elevation(message: Message) {
    let permlevel = 0;
    if (message.author.id === this.#ownerID) return 4;
    if (message.guild === null) return 0;

    const flags = PermissionsBitField.Flags;
    const hasPerm = (flag: bigint) => message.member?.permissions.has(flag);

    if (
      hasPerm(flags.ManageRoles) &&
      hasPerm(flags.ManageChannels) &&
      hasPerm(flags.ManageMessages)
    )
      permlevel = 2;
    if (hasPerm(flags.Administrator)) permlevel = 3;

    return permlevel;
  }

  #getMessageCommand(name: string) {
    const command = this.#messageCommands.get(name);
    if (command) return command;

    const commandByAlias = this.#aliases.get(name);
    if (commandByAlias) return commandByAlias;

    return null;
  }

  addMessageCommand(cmd: MessageCommand) {
    this.#messageCommands.set(cmd.help.name, cmd);
    cmd.conf.aliases.forEach((alias) => {
      this.#aliases.set(alias, cmd);
    });
    this.#collector.loadMessageCommand(cmd);
  }

  runMessageCommand(message: Message) {
    const { PREFIX } = process.env;
    const commandName = message.content.split(" ")[0].slice(PREFIX!.length).toLowerCase();
    const args = message.content.split(" ").slice(1);
    const perms = this.#elevation(message);

    const cmd = this.#getMessageCommand(commandName);

    if (!cmd) return console.error(`Couldn't find ${commandName} command`);

    if (perms < cmd.conf.permLevel)
      return message.reply("You don't have the permissions to use that");

    cmd.run(message, args, this.#client);
  }
}
export default MessageCommandManager;
