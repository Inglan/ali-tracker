const socket = new WebSocket("wss://ws.alimad.co/socket");
import { appendFile } from "node:fs/promises";

type ActivitySample = {
  type: "sample";
  data?: {
    device: string;
    app: string;
    title: string;
    ramPercent: number; // 0–1
    cpuPercent: number; // 0–1
    wifi: string | null; // SSID; null if not connected/unknown
    isIdle: boolean;
    isSleeping: boolean;
    ip: string; // e.g., "192.168.10.9"
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
