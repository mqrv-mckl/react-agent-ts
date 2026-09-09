import dotenv from "dotenv";
import { Agent, run } from "@openai/agents";

dotenv.config();

// define agents

const uiuxAgent = new Agent({
  name: "UI/UX Expert",
  instructions: "You provide assistance for designing UI/UX",
});

const webdevAgent = new Agent({
  name: "Web Developer",
  instructions: "You provide help for web development stuff",
});

const triageAgent = new Agent({
  name: "Triage Agent",
  instructions:
    "You determine which agent to use based on the user's question.",
  handoffs: [uiuxAgent, webdevAgent],
});

// run agents
async function main() {
  const result = await run(
    triageAgent,
    "Name important web development principles?",
  );
  console.log(result.finalOutput);
}

main().catch((err) => console.error(err));
