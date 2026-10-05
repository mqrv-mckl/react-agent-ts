import { Agent } from "./agent/agent.js";
import { addElementToApp, getAllElements } from "./agent/tools.js";

const agent = new Agent([addElementToApp, getAllElements], 10);

agent.query(
  "List all container elements. Then add one that aligns it's children in one line to the app.",
);
