import { useSocketConnection } from "@/utils/hooks/useSocketConnection";
import { shatSocket } from "@/utils/socket";
import { FormEvent, useEffect, useState } from "react";

const Socket = (): JSX.Element => {
  const [shats, setShats] = useState<string[]>([]);
  const [shat, setShat] = useState("");

  const isConnected = useSocketConnection(shatSocket);

  useEffect(() => {
    function onNewShat(newShat: string) {
      setShats((p) => p.concat(newShat));
    }

    shatSocket.on("newShat", onNewShat);

    shatSocket.once("allShats", (allShats) => {
      setShats(allShats);
    });

    return () => {
      shatSocket.off("newShat", onNewShat);
    };
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (shat === "") return;

    shatSocket.emit("newShat", shat);
    setShat("");
  };

  return (
    <div>
      <p>Connected: {isConnected ? "yeah" : "no"}</p>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {shats.map((shat, index) => (
          <p key={index}>{shat}</p>
        ))}
      </div>

      <form id="form" onSubmit={handleSubmit}>
        <input
          autoComplete="off"
          value={shat}
          onChange={(e) => setShat(e.target.value)}
          disabled={!isConnected}
        />
        <button disabled={!isConnected}>Send</button>
      </form>
    </div>
  );
};

export default Socket;
