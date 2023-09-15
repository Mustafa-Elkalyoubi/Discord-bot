import { Partials, GatewayIntentBits, Routes } from "discord.js";
import ExtendedClient from "./utils/Client";
import fs from "node:fs";
import path from "node:path";
import { DateTime } from "luxon";
import { registerCommands, registerContextCommands, registerSubCommands } from "./utils/Registry";

import config from "./config.json";
import { DEFAULT, GREEN } from "./utils/ConsoleText";
import env from "dotenv";

env.config({ path: path.join(__dirname, "..", ".env") });
const { DISCORD_TOKEN: token } = process.env;
if (!token) throw "Missing token";

const client = new ExtendedClient(
  {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
    ],
    allowedMentions: { parse: ["roles", "users"], repliedUser: true },
    partials: [Partials.Channel],
    rest: { version: "10" },
  },
  config.ownerID,
  token
);

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath);
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  import(filePath).then((event) => {
    if (event.once) client.once(event.name, (...args) => event.run(...args, client));
    else client.on(event.name, (...args) => event.run(...args, client));
  });
}

const messagesPath = path.join(__dirname, "message_commands");
const messagesFiles = fs.readdirSync(messagesPath);
let messageCommandsCount = 0;
messagesFiles.forEach(async (file) => {
  messageCommandsCount++;
  const props = await import(path.join(messagesPath, file));
  console.log(
    `${GREEN}[${DateTime.now().toFormat(
      "yyyy-MM-DD HH:mm:ss"
    )}]: ${DEFAULT}Loading command #${messageCommandsCount}: ${props.help.name}`
  );
  client.messageCommands.set(props.help.name, props);
  props.conf.aliases.forEach((alias: string) => {
    client.aliases.set(alias, props.help.name);
  });
});

async function registerJSONs(client: ExtendedClient) {
  try {
    await registerCommands(client);
    await registerSubCommands(client);
    await registerContextCommands(client);

    const allServersCommandJSONs = client.commands
      .filter((cmd) => cmd.all)
      .map((cmd) => cmd.getSlashCommandJSON());
    const allServersSubCommandJSONs = client.subCommands
      .filter((cmd) => cmd.all)
      .map((cmd) => cmd.getSlashCommandJSON());
    const allServersContextJSONs = client.contextCommands
      .filter((cmd) => cmd.all)
      .map((cmd) => cmd.getContextCommandJSON());

    const privateCommandJSONs = client.commands
      .filter((cmd) => !cmd.all)
      .map((cmd) => cmd.getSlashCommandJSON());
    const privateSubCommandJSONs = client.subCommands
      .filter((cmd) => !cmd.all)
      .map((cmd) => cmd.getSlashCommandJSON());
    const privateContextJSONs = client.contextCommands
      .filter((cmd) => !cmd.all)
      .map((cmd) => cmd.getContextCommandJSON());

    if (
      allServersCommandJSONs === undefined ||
      allServersSubCommandJSONs === undefined ||
      allServersContextJSONs === undefined
    )
      return;

    await client.rest.put(Routes.applicationCommands(config.clientID), {
      body: [...allServersCommandJSONs, ...allServersSubCommandJSONs, ...allServersContextJSONs],
    });

    await client.rest.put(Routes.applicationGuildCommands(config.clientID, config.testGuild), {
      body: [...privateCommandJSONs, ...privateSubCommandJSONs, ...privateContextJSONs],
    });
    // const registeredCommands = await client.rest.get(Routes.applicationCommands(config.clientID));
  } catch (error) {
    console.error(error);
  }
}

registerJSONs(client);
client.login(token);
