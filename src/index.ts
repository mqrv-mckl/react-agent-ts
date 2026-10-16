import { serve } from "@hono/node-server";
import { Agent } from "./agent/agent.js";
import { Chat } from "./agent/chat.js";
import app from "./mcp/server.js";
import { createAndConnectClient } from "./mcp/client.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { ChatHistory } from "./agent/chatHistory.js";
import type { AutoSummaryOptions } from "./agent/types.js";

const server = serve(app);

// create transport, define and connect client
const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3000/mcp"),
);
const mcpClient = await createAndConnectClient(transport);

// define the agent
const llmBaseURL = "http://localhost:8080/v1";
const llmApiKey = "dummy";
const autoSummaryOptions: AutoSummaryOptions = {
  contextLength: 262144, // https://huggingface.co/unsloth/Qwen3.8-27B-GGUF#model-overview
  charactersPerToken: 4, // https://qwen.readthedocs.io/en/latest/getting_started/concepts.html#byte-level-byte-pair-encoding
};
const agent = new Agent(
  mcpClient,
  new Chat(llmBaseURL, llmApiKey),
  new ChatHistory(new Chat(llmBaseURL, llmApiKey), true, autoSummaryOptions),
  10,
);

await agent.initialize();

// querys
await agent.query(
  "Add the container element to the app, that aligns it's children in one line.",
);
await agent.query("Now add a button to the app.");
// the following querries are used to fill the context to test auto summary
await agent.query(
  "Can you tell me which elements are available in general? List all of them in your answer.",
);
await agent.query(
  "Explain with a little more detail, what the Rich Textarea component does.",
);
await agent.query(
  "Explain with a little more detail, what the Button component does.",
);

// disconnect cleanly
await transport.terminateSession();
await mcpClient.close();
server.close();
