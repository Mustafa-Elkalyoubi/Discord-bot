import { socket } from "@/utils/socket";
import { useEffect } from "react";

const SocketConnecter = () => {
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return null;
};

export default SocketConnecter;
