import { Partials, GatewayIntentBits, Routes } from "discord.js";
import ExtendedClient from "./utils/Client";
import fs from "node:fs";
import path from "node:path";
import { DateTime } from "luxon";
import { registerCommands, registerContextCommands, registerSubCommands } from "./utils/Registry";

import config from "./config.json";
import { DEFAULT, GREEN } from "./utils/ConsoleText";
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
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
  const event = require(filePath);
  if (event.once) client.once(event.name, (...args) => event.run(...args, client));
  else client.on(event.name, (...args) => event.run(...args, client));
}

const messagesPath = path.join(__dirname, "message_commands");
const messagesFiles = fs.readdirSync(messagesPath);
var messageCommandsCount = 0;
messagesFiles.forEach((file) => {
  messageCommandsCount++;
  const props = require(path.join(messagesPath, file));
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

    const commandJSONs = client.commands.map((cmd) => cmd.getSlashCommandJSON());
    const subCommandJSONs = client.subCommands.map((cmd) => cmd.getSlashCommandJSON());
    const contextJSONs = client.contextCommands.map((cmd) => cmd.getContextCommandJSON());

    if (commandJSONs === undefined || subCommandJSONs === undefined || contextJSONs === undefined)
      return;

    await client.rest.put(Routes.applicationCommands(config.clientID), {
      body: [...commandJSONs, ...subCommandJSONs, ...contextJSONs],
    });
    // const registeredCommands = await client.rest.get(Routes.applicationCommands(config.clientID));
  } catch (error) {
    console.error(error);
  }
}

registerJSONs(client);
client.login(token);