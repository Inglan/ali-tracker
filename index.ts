const socket = new WebSocket("wss://ws.alimad.co/socket");
import { appendFile } from "node:fs/promises";

// This was AI generated, thanks gpt-5
type MetaFlags = {
  slack: boolean;
  discord: boolean;
  "whatsapp.root": boolean;
  code: boolean;
  chrome: boolean;
  windowsterminal: boolean;
};

export interface ActivitySample {
  type: string;
  data?: {
    device: string; // e.g., "ALIMAD-PC"
    app: string;
    title: string;
    ramPercent: number; // 0..1 if it's a fraction; rename to ramUsage if 0..100 later
    cpuPercent: number; // same note as above
    batteryPercent: number; // 0..100
    wifi: string | null; // SSID; null if disconnected
    isIdle: boolean;

    meta: MetaFlags;

    fullscreen: boolean;
    splitLeft: boolean;
    splitRight: boolean;

    keys: string; // raw key sequence if any
    keysPressed: number;
    mouseClicks: number;

    isSleeping: boolean;

    localIp: string; // IPv4 string
    ip: string; // public IPv4/IPv6 string

    timestamp: string; // ISO 8601
  };
}
// End ai generated part

let currentWindowTitle = "";

socket.addEventListener("message", async (event) => {
  const message = JSON.parse(event.data) as ActivitySample;

  if (message.type == "sample") {
    if (message.data?.title !== currentWindowTitle) {
      currentWindowTitle = message.data?.title || "";
      console.log("window title changed to:", currentWindowTitle);
    }
  }
});
