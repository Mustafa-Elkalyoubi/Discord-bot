import { GatewayIntentBits, Partials } from "discord.js";
import env from "dotenv";
import mongoose from "mongoose";
import ExtendedClient from "./utils/Client.js";

env.config();

const { DISCORD_TOKEN, OWNER_ID, CLIENT_ID, TEST_GUILD, PREFIX } = process.env;
if (!DISCORD_TOKEN) throw Error("Missing token");
if (!OWNER_ID) throw Error("Missing owner id");
if (!CLIENT_ID) throw Error("Missing client id");
if (!TEST_GUILD) throw Error("Missing test guild id");
if (!PREFIX) throw Error("Missing prefix");

let client: ExtendedClient;

async function initializeDatabase() {
  const { connection } = await mongoose.connect("mongodb://127.0.0.1:27017", {
    appName: "discord-bot",
    dbName: "discord-bot",
  });

  connection.on("error", (err) => {
    console.error(err);
  });
}

async function initializeClient() {
  if (client) {
    await client.cleanup();
  }

  client = new ExtendedClient(
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

  client.login(DISCORD_TOKEN);
  client.commandManager.registerCommands();
}

async function main() {
  initializeDatabase();
  initializeClient();
}

main();

if (import.meta.hot) {
  import.meta.hot.accept(async () => {
    if (client) {
      await client.cleanup();
    }
  });
}
