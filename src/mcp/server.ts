import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import z from "zod";
import { elements } from "../environment/elements.js";
import { App } from "../environment/app.js";
import { createMcpHonoApp } from "@modelcontextprotocol/hono";
import type { Context } from "hono";

// define the MCP handler
const handler = createMcpHandler(() => {
  const server = new McpServer({
    name: "web-app-builder-agent",
    version: "1.0.0",
  });

  // define and register all tools
  server.registerTool(
    "get-all-elements",
    {
      description:
        "Returns a list of all available elements including their IDs in JSON format. No input required.",
      inputSchema: z.object({}),
    },
    async () => {
      return {
        content: [{ type: "text", text: JSON.stringify(elements) }],
      };
    },
  );

  server.registerTool(
    "add-element-to-app",
    {
      description: "Adds the element with the given elementId to the web app.",
      inputSchema: z.object({
        elementId: z
          .string()
          .describe("The ID of the element to add to the web app"),
      }),
    },
    async ({ elementId }) => {
      return {
        content: [
          {
            type: "text",
            text: `success: ${App.getInstance().addElement(elementId)}`,
          },
        ],
      };
    },
  );

  return server;
});

const app = createMcpHonoApp();
app.all("/mcp", (c: Context) =>
  handler.fetch(c.req.raw, { parsedBody: c.get("parsedBody") }),
);

export default app;
