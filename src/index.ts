import { Agent } from "./agent/agent.js";
import { Chat } from "./agent/chat.js";
import { addElementToApp, getAllElements } from "./agent/tools.js";

const agent = new Agent(
  new Chat("http://localhost:8080/v1", "dummy"),
  [addElementToApp, getAllElements],
  10,
);

await agent.query(
  "List all container elements. Then add one that aligns it's children in one line to the app.",
);
await agent.query("Now add a button to the app.");
