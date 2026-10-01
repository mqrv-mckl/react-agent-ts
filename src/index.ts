import { Agent } from "./agent.js";
import { addElementToApp, getAllElements } from "./tools.js";

const agent = new Agent([addElementToApp, getAllElements], 5);

agent.query("List all container elements.");
