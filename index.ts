const socket = new WebSocket("wss://ws.alimad.co/socket");
import { appendFile, writeFile, mkdir } from "node:fs/promises";
import { OpenRouter } from "@openrouter/sdk";

mkdir("./screenshots", { recursive: true });
mkdir("./justifications", { recursive: true });

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

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

  if (message.type == "screenshot") {
    // @ts-ignore
    const res = await fetch(message.data);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const arrayBuffer = await res.arrayBuffer();
    // @ts-ignore
    await writeFile(
      "./screenshots/" + message.timestamp + ".png",
      Buffer.from(arrayBuffer),
    );

    console.log("Downloaded");
  }
  if (message.type == "sample") {
    if (message.data?.title !== currentWindowTitle) {
      currentWindowTitle = message.data?.title || "";
      const openRouterResponse = await openRouter.chat
        // @ts-ignore
        .send({
          messages: [
            {
              role: "system",
              content: `You are a model built to identify sensitive data from window titles. You will respond with no, if there is no sensitive data in the title. You will not respond with anything else.]
            If there is sensitive data, or there could be on the screen, you will respond with a breif justification.
            Sensetive data includes:
             - Credentials
             - Messages on platforms such as discord, whatsapp, and slack
             - Other personal information`,
            },
            {
              role: "user",
              content: currentWindowTitle,
            },
          ],
          model: "openai/gpt-oss-20b",
          stream: false,
          provider: "groq",
        });
      if (openRouterResponse.choices[0]?.message.content != "no") {
        console.log(openRouterResponse.choices[0]?.message.content);
        socket.send(
          JSON.stringify({ type: "request", device: message.data?.device }),
        );
        await writeFile(
          "./justifications/" + new Date() + ".txt",
          openRouterResponse.choices[0]?.message.content?.toString() || "",
        );
      }
    }
  }
});
