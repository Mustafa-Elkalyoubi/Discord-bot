type ClientEvents = import("discord.js").ClientEvents;

interface DiscordEventHandler<T extends keyof ClientEvents> {
  name: T;
  run: (...params: [...ClientEvents[T], client: ExtendedClient]) => unknown | Promise<unknown>;
  once?: boolean;
}

type UserFineData = {
  username: string;
  fineAmount: number;
  fineCap: number;
  capReached: boolean;
};

interface FineData {
  userFineData: {
    [userid: string]: UserFineData;
  };
}

type OSRSWikiData = Array<{
  examine: string;
  id: number;
  members: boolean;
  lowalch: number;
  limit: number;
  value: number;
  highalch: number;
  icon: string;
  name: string;
}>;
