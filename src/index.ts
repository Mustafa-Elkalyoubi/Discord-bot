import { Partials, GatewayIntentBits, Routes } from "discord.js";
import ExtendedClient from "./utils/Client";
import fsPromise from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { registerCommands, registerContextCommands, registerSubCommands } from "./utils/Registry";
import { dynamicImport } from "./utils/general";

env.config({ path: path.join(__dirname, "..", ".env") });
const { DISCORD_TOKEN: token } = process.env;
if (!token) throw "Missing token";

const client = new ExtendedClient(
  {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers,
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
const loadEvents = async (currPath = eventsPath) => {
  const eventFiles = fs.readdirSync(currPath);
  for (const file of eventFiles) {
    const filePath = path.join(currPath, file);
    const stat = await fsPromise.lstat(filePath);

    if (stat.isDirectory()) loadEvents(path.join(currPath, file));
    else
      dynamicImport(filePath).then((event) => {
        client.log("", `Loading Event: ${event.name}`);
        if (event.once) client.once(event.name, (...args) => event.run(...args, client));
        else client.on(event.name, (...args) => event.run(...args, client));
      });
  }
};

loadEvents();

async function registerJSONs(client: ExtendedClient) {
  try {
    await registerCommands(client);
    await registerSubCommands(client);
    await registerContextCommands(client);

    const { publicCommands, privateCommands } = client.commandManager.getCommandJSON();

    await client.rest.put(Routes.applicationCommands(config.clientID), {
      body: publicCommands,
    });

    await client.rest.put(Routes.applicationGuildCommands(config.clientID, config.testGuild), {
      body: privateCommands,
    });
    // const registeredCommands = await client.rest.get(Routes.applicationCommands(config.clientID));
  } catch (error) {
    console.error(error);
  }
}

registerJSONs(client);
client.login(token);

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) =>
  process.on(signal, async () => {
    await saveLastMessageID(client);

    process.exit();
  })
);
