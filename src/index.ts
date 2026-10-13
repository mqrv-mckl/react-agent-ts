import { serve } from "@hono/node-server";
import { Agent } from "./agent/agent.js";
import { Chat } from "./agent/chat.js";
import app from "./mcp/server.js";
import { createAndConnectClient } from "./mcp/client.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { ChatHistory } from "./agent/chatHistory.js";

const server = serve(app);

// create transport, define and connect client
const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3000/mcp"),
);
const mcpClient = await createAndConnectClient(transport);

// define the agent
const llmBaseURL = "http://localhost:8080/v1";
const llmApiKey = "dummy";
const agent = new Agent(
  mcpClient,
  new Chat(llmBaseURL, llmApiKey),
  new ChatHistory(0, false, new Chat(llmBaseURL, llmApiKey)), // TODO: change arguments after implementing (auto) summary
  10,
);

await agent.initialize();

// querys
await agent.query(
  "List all container elements. Then add one that aligns it's children in one line to the app.",
);
await agent.query("Now add a button to the app.");

// disconnect cleanly
await transport.terminateSession();
await mcpClient.close();
server.close();
