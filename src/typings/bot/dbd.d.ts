type DbdRole = "killer" | "survivor";

interface DBDPerk {
  id: string;
  name: string;
  description: string;
  role: DbdRole;
  character: number | null;
  image: string;
}

interface DBDPower {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface DBDChar {
  id: string;
  charid: string;
  name: string;
  gender: "male" | "female" | "nothuman" | "multiple";
  dlc: string | null;
  image: string;
  perks: [string, string, string];
}

interface dbdSurvivor extends DBDChar {
  role: "survivor";
  item: null;
}

interface dbdKiller extends DBDChar {
  role: "killer";
  item: string;
}

type DBDCharacter = dbdSurvivor | dbdKiller;

interface DBDDLC {
  id: string;
  name: string;
  steamid: number;
  time: number;
}
