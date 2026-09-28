import { Agent } from "./agent.js";
import { addElementToApp, getAllElements } from "./tools.js";

const agent = await Agent.create([addElementToApp, getAllElements], 4);

await agent.query(
  "I want you to list all the available layout elements for me.",
);
