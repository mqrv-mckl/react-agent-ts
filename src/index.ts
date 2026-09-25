import { Agent } from "./agent.js";
import { addElementToApp, getAllElements } from "./tools.js";

const agent = await Agent.create([addElementToApp, getAllElements], 4);

// TODO: write query for testing
await agent.query("");
