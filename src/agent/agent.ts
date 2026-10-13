import type { Client } from "@modelcontextprotocol/client";
import z from "zod";
import { Chat, ReasoningEffort } from "./chat.js";
import {
  MessageResponseSchema,
  type MessageResponse,
  type Observation,
} from "./types.js";
import type { ChatHistory } from "./chatHistory.js";

/**
 * Represents a ReAct agent.
 * @class
 */
export class Agent {
  /**
   * Creates a new Agent instance.
   * @constructor
   * @param {Client} mcpClient - The MCP client instance used for tools.
   * @param {Chat} chat - The Chat instance used by the agent.
   * @param {ChatHistory} chatHistory - The ChatHistory instance used by the agent.
   * @param {number} maxTurns - The maximum number of turns per query before the agent stops.
   * @example
   * const agent = new Agent(
   *   await createAndConnectClient(
   *     new StreamableHTTPClientTransport(
   *       new URL("http://localhost:3000/mcp"),
   * .   )
   *   ),
   *   new Chat("http://localhost:8080/v1", "dummy"),
   *   10,
   * );
   */
  constructor(
    private readonly mcpClient: Client,
    private readonly chat: Chat,
    private readonly chatHistory: ChatHistory,
    private readonly maxTurns: number,
  ) {}

  /**
   * Initializes the Agent. Must be called before using query!
   */
  async initialize() {
    this.chatHistory.addAndLogMessage({
      role: "system",
      content: await this.getSystemPrompt(),
    });
    console.log("Successfully initialized the agent");
  }

  /**
   * Runs the agent loop for a single user prompt.
   * @method
   * @async
   * @param {string} prompt - The user prompt.
   * @returns {Promise<void>}
   */
  async query(prompt: string): Promise<void> {
    this.chatHistory.addAndLogMessage({ role: "user", content: prompt });

    for (let i = 0; i < this.maxTurns; i++) {
      const rawResponse = await this.chat.sendMessage(
        this.chatHistory.get(),
        MessageResponseSchema,
      );

      let jsonResponse;
      try {
        jsonResponse = JSON.parse(rawResponse);
      } catch {
        jsonResponse = undefined;
      }

      const response = await MessageResponseSchema.safeParseAsync(jsonResponse);
      let observation: Observation;

      if (!response.success) {
        // if response format was invalid, add rawResponse and observation
        this.chatHistory.addAndLogMessage({
          role: "assistant",
          content: rawResponse,
        });
        observation = {
          success: false,
          data: {
            errorMessage:
              "Invalid message response format! Details:\n" + response.error,
          },
        };
      } else {
        // if response format was valid ...
        const parsedResponse = response.data;

        // add the LLM's response to messages
        this.chatHistory.addAndLogMessage({
          role: "assistant",
          content: JSON.stringify(parsedResponse),
        });

        // check if final answer
        if (parsedResponse.isFinalAnswer) {
          console.log("Final Answer:", parsedResponse.thought, "\n");
          return;
        }

        // execute action
        try {
          observation = await this.executeAction(parsedResponse);
        } catch (e) {
          observation = {
            success: false,
            data: {
              errorMessage:
                "An error occurred while running the tool" +
                (e instanceof Error ? ": " + e.message : "."),
            },
          };
        }
      }

      // add observation to messages
      this.chatHistory.addAndLogMessage({
        role: "user",
        content: JSON.stringify(observation),
      });

      // check if turn limit reached
      if (i === this.maxTurns - 1) {
        console.warn("Turn limit reached. Stopped without a final answer.");
      }
    }
  }

  /**
   * Assembles and returns the system prompt.
   * @method
   * @async
   * @returns {Promise<string>} A promise that resolves with the complete system prompt.
   */
  private async getSystemPrompt(): Promise<string> {
    // system prompt is inspired by https://github.com/mattambrogi/agent-implementation/
    // TODO: optimize system prompt
    return `
You run in a loop of Thought, Action, PAUSE, Observation.
At the end of the loop you output an Answer.
Use Thought to describe your thoughts about the question you have been asked.
Use Action to run one of the actions available to you.
After that you'll get the Observation, which will be the result of running those actions.

Your final answer must only contain a short summary of what you did. Put this summary into the thought-property of the returned object. Other properties like action and actionInput must stay empty in the final answer.

Your available actions are:

${await this.getToolString()}

Only reply in the format shown by the JSON schema below! Just RAW JSON, no backticks (so not formatted as a codeblock), no linebreaks around it and nothing else! Just a raw string in JSON format.
${JSON.stringify(z.toJSONSchema(MessageResponseSchema))}
`;
  }

  /**
   * Builds and returns a string that lists all of the agent's tools in JSON format.
   * @method
   * @async
   * @returns {Promise<string>} A Promise that resolves with the list of the agent's tools in JSON format.
   */
  private async getToolString(): Promise<string> {
    const { tools } = await this.mcpClient.listTools();
    return tools
      .map((t) =>
        JSON.stringify({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema,
        }),
      )
      .join("\n");
  }

  /**
   * Executes a tool specified within a MessageResponse object.
   * Be sure to parse the MessageResponse object before passing it, since it is not parsed within this method.
   * @method
   * @async
   * @param {MessageResponse} parsedResponse - The parsed MessageResponse object that contains the tool to be executed.
   * @returns {Promise<Observation>} A promise that resolves with an observation that contains informations about tool execution and potential errors.
   */
  private async executeAction(
    parsedResponse: MessageResponse,
  ): Promise<Observation> {
    const result = await this.mcpClient.callTool({
      name: parsedResponse.action,
      arguments: parsedResponse.actionInput,
    });

    return {
      success: !result.isError,
      data: result.content,
    };
  }
}
