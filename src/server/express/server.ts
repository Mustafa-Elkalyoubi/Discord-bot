import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import runBot from "../bot/index.ts";
import DataCollector from "../DataCollector/DataCollector.ts";
import loadShatHandler from "../ShatHandler.ts";
import app from "./restApi.ts";

const server = createServer();

server.on("request", app);

export type SocketServer = typeof io;
const io = new Server(server, { cors: { origin: "http://localhost:9000" } });

loadShatHandler(io);

const collector = new DataCollector();

server.listen(9001, () => {
  console.log(`API v1 and Socket.io server running on http://localhost:9001`);
});

runBot(collector);
