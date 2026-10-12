import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";

/**
 * Creates a new MCP client and connects it to a MCP server via HTTP using the given transport instance.
 *
 * @param {StreamableHTTPClientTransport} transport - The transport used to connect to a MCP server.
 * @returns {Promise<Client>} A promise that resolves with the connected client.
 */
export async function createAndConnectClient(
  transport: StreamableHTTPClientTransport,
): Promise<Client> {
  const client = new Client({ name: "client", version: "1.0.0" });
  console.log("Created a MCP client");

  await client.connect(transport);
  console.log("Connected the MCP client to the MCP server");

  return client;
}
