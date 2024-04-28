import { GatewayIntentBits, Partials, Routes } from "discord.js";
import env from "dotenv";
import fs from "node:fs";
import fsPromise from "node:fs/promises";
import path from "node:path";
import ExtendedClient from "./utils/Client";
import { saveLastMessageID } from "./utils/FineHelper";
import { registerCommands, registerContextCommands, registerSubCommands } from "./utils/Registry";
import { dynamicImport } from "./utils/general";

env.config({ path: path.join(__dirname, "..", ".env") });
const { DISCORD_TOKEN, OWNER_ID, CLIENT_ID, TEST_GUILD, PREFIX } = process.env;
if (!DISCORD_TOKEN) throw Error("Missing token");
if (!OWNER_ID) throw Error("Missing owner id");
if (!CLIENT_ID) throw Error("Missing client id");
if (!TEST_GUILD) throw Error("Missing test guild id");
if (!PREFIX) throw Error("Missing prefix");

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
  OWNER_ID,
  DISCORD_TOKEN
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

    await client.rest.put(Routes.applicationCommands(CLIENT_ID!), {
      body: publicCommands,
    });

    await client.rest.put(Routes.applicationGuildCommands(CLIENT_ID!, TEST_GUILD!), {
      body: privateCommands,
    });
    // const registeredCommands = await client.rest.get(Routes.applicationCommands(CLIENT_ID));
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
