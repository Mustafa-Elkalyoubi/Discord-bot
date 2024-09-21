interface ShatServerToClientEvents {
  newShat: (newShat: string) => unknown;
  allShats: (allShats: string[]) => unknown;
}

interface ShatClientToServerEvents {
  newShat: (newShat: string) => unknown;
}

interface ShatInterServerEvents {
  ping: () => void;
}

interface ShatSocketData {
  shats: string[];
}
