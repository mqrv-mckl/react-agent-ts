import dotenv from "dotenv";
import { Agent, run } from "@openai/agents";

dotenv.config();

// const api_key = process.env.OPENAI_API_KEY;

const agent = new Agent({
  name: "Usual AI Agent",
  // instructions: "...",
});

const result = await run(agent, "How are you today?");
console.log(result.finalOutput);
