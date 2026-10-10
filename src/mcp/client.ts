import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";

export async function createAndConnectClient(): Promise<Client> {
  const client = new Client({ name: "client", version: "1.0.0" });
  console.log("Created a MCP client");

  const transport = new StreamableHTTPClientTransport(
    new URL("http://localhost:3000/mcp"),
  );

  await client.connect(transport);
  console.log("Connected the MCP client to the MCP server");

  return client;
}
