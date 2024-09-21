import { shatNamespace } from "@/server/ShatHandler";
import { Manager, Socket } from "socket.io-client";

const baseURL = "http://localhost:9001";

const manager = new Manager(baseURL, { autoConnect: false });

export const socket = manager.socket("/");

export const shatSocket: Socket<ShatServerToClientEvents, ShatClientToServerEvents> =
  manager.socket(shatNamespace);
