const socket = new WebSocket("wss://ws.alimad.co/socket");
import { appendFile } from "node:fs/promises";

// This was AI generated, thanks gpt-5
type ActivitySample = {
  type: "sample";
  data?: {
    device: string;
    app: string;
    title: string;
    ramPercent: number;
    cpuPercent: number;
    wifi: string | null;
    isIdle: boolean;
    isSleeping: boolean;
    ip: string;
  };
};

socket.addEventListener("message", async (event) => {
  const message = JSON.parse(event.data) as ActivitySample;

  if (message.type == "sample") {
    await appendFile(
      "log.csv",
      `${message.data?.device},${message.data?.app},${message.data?.title},${message.data?.ramPercent},${message.data?.cpuPercent},${message.data?.wifi},${message.data?.isIdle},${message.data?.isSleeping},${message.data?.ip}\n`,
    );
  }
});
