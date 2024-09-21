import { Namespace, Server } from "socket.io";

export const shatNamespace = "/shats";

const shats: string[] = [];

function loadShatHandler(io: Server) {
  const namespace: Namespace<
    ShatClientToServerEvents,
    ShatServerToClientEvents,
    ShatInterServerEvents,
    ShatSocketData
  > = io.of(shatNamespace);

  namespace.on("connection", (socket) => {
    console.log(`[${socket.handshake.address}]: Connected`);

    socket.emit("allShats", shats);

    socket.on("newShat", (newShat) => {
      shats.push(newShat);

      console.log(`[${socket.handshake.address}]: ${newShat}`);

      namespace.emit("newShat", newShat);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[${socket.handshake.address}]: Disconnected (${reason})`);
    });
  });
}

export default loadShatHandler;
