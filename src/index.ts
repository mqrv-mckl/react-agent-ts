import dotenv from "dotenv";
import { Agent, run } from "@openai/agents";
import { add_element_to_app } from "./tools.js";

dotenv.config();

// define agents
const agent = new Agent({
  name: "Web App Builder",
  instructions:
    "You build web applications by combining several types of elements to best meet the needs of the user",
  tools: [add_element_to_app],
});

// run agents
async function main() {
  const prompt = "Add the element with id 'Button'";
  console.log(">> Yout prompt: ", prompt);
  const result = await run(agent, prompt);
  console.log(">> Agent response: ", result.finalOutput);
}

main().catch((err) => console.error(err));
