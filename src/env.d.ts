export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [k: string]: string | undefined;
      DISCORD_TOKEN: string;
      OWNER_ID: string;
      CLIENT_ID: string;
      PREFIX: string;
      DM_CHANNEL: string;
      TEST_GUILD: string;
      STEAM_KEY: string;
    }
  }
}
