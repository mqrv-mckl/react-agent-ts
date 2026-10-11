import { serve } from "@hono/node-server";
import { Agent } from "./agent/agent.js";
import { Chat } from "./agent/chat.js";
import { addElementToApp, getAllElements } from "./agent/tools.js";
import app from "./mcp/server.js";
import { createAndConnectClient } from "./mcp/client.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

serve(app);

// create transport, define and connect client
const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3000/mcp"),
);
const mcpClient = await createAndConnectClient(transport);

console.log(mcpClient.getServerVersion());
console.log(mcpClient.getServerCapabilities());
console.log(await mcpClient.listTools());

// define the agent
const agent = new Agent(
  mcpClient,
  new Chat("http://localhost:8080/v1", "dummy"),
  [addElementToApp, getAllElements],
  10,
);

// querys
await agent.query(
  "List all container elements. Then add one that aligns it's children in one line to the app.",
);
await agent.query("Now add a button to the app.");

// disconnect cleanly
await transport.terminateSession();
await mcpClient.close();
