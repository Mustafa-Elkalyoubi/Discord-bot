export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [k: string]: string | undefined;
      DISCORD_TOKEN: string | undefined;
      OWNER_ID: string | undefined;
      CLIENT_ID: string | undefined;
      PREFIX: string | undefined;
      DM_CHANNEL: string | undefined;
      TEST_GUILD: string | undefined;
    }
  }
}
