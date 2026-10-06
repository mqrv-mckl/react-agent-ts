import z from "zod";
import { Chat } from "./chat.js";
import {
  MessageResponseSchema,
  ToolInputSchema,
  type Message,
  type MessageResponse,
  type Tool,
  type ToolInput,
  type ToolResult,
} from "./types.js";

/**
 * Represents a ReAct agent.
 * @class
 */
export class Agent {
  /**
   * The message history of the agent, including the system prompt as well as messages by the user and the LLM's responses.
   * @property {Message[]}
   */
  private readonly messages: Message[] = [];

  /**
   * Creates a new Agent instance.
   * @constructor
   * @param {Chat} chat - The Chat instance used by the agent.
   * @param {Tool[]} tools - The tools that the agent can execute.
   * @param {number} maxTurns - The maximum number of turns per query before the agent stops.
   * @example
   * const agent = new Agent(
   *   new Chat("http://localhost:8080/v1", "dummy"),
   *   [addElementToApp, getAllElements],
   *   10,
   * );
   */
  constructor(
    private readonly chat: Chat,
    private readonly tools: Tool[],
    private readonly maxTurns: number,
  ) {
    this.addAndLogMessage({
      role: "system",
      content: this.getSystemPrompt(),
    });
  }

  /**
   * Runs the agent loop for a single user prompt.
   * @method
   * @async
   * @param {string} prompt - The user prompt.
   * @returns {Promise<void>}
   */
  async query(prompt: string): Promise<void> {
    this.addAndLogMessage({ role: "user", content: prompt });

    for (let i = 0; i < this.maxTurns; i++) {
      const rawResponse = await this.chat.sendMessage(this.messages);

      let jsonResponse;
      try {
        jsonResponse = JSON.parse(rawResponse);
      } catch {
        jsonResponse = undefined;
      }

      const response = await MessageResponseSchema.safeParseAsync(jsonResponse);
      let observation: ToolResult;

      if (!response.success) {
        // if response format was invalid, add rawResponse and observation
        this.addAndLogMessage({ role: "assistant", content: rawResponse });
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
        this.addAndLogMessage({
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
      this.addAndLogMessage({
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
   * @returns {string} The complete system prompt.
   */
  private getSystemPrompt(): string {
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

${this.getToolString()}

Only reply in the format shown by the JSON schema below! Just RAW JSON, no backticks (so not formatted as a codeblock), no linebreaks around it and nothing else! Just a raw string in JSON format.
${JSON.stringify(z.toJSONSchema(MessageResponseSchema))}
`;
  }

  /**
   * Builds and returns a string that lists all of the agent's tools in JSON format.
   * @method
   * @returns {string} The list of the agent's tools in JSON format.
   */
  private getToolString(): string {
    return this.tools
      .map((t) =>
        JSON.stringify({
          name: t.name,
          description: t.description,
          inputSchema: z.toJSONSchema(t.inputSchema),
        }),
      )
      .join("\n");
  }

  /**
   * Logs the latest entry of the message history to the console.
   * @method
   */
  private logLatestMessage(): void {
    console.log("Added the following to messages[]:");
    console.log(this.messages[this.messages.length - 1], "\n");
  }

  /**
   * Adds a new message to the message history and logs it to the console.
   * @method
   * @param {Message} message - The message to be added to the history and logged.
   */
  private addAndLogMessage(message: Message): void {
    this.messages.push({
      role: message.role,
      content: message.content,
    });
    this.logLatestMessage();
  }

  /**
   * Executes a tool specified within a MessageResponse object.
   * Be sure to parse the MessageResponse object before passing it, since it is not parsed within this method.
   * @method
   * @async
   * @param {MessageResponse} parsedResponse - The parsed MessageResponse object that contains the tool to be executed.
   * @returns {Promise<ToolResult>} A promise that resolves with the ToolResult of the execution.
   */
  private async executeAction(
    parsedResponse: MessageResponse,
  ): Promise<ToolResult> {
    const action = parsedResponse.action;
    const tool = this.tools.find((t) => t.name === action);
    if (!tool) {
      return {
        success: false,
        data: {
          errorMessage: `Tool ${action} not found.`,
        },
      };
    }

    // the following doesn't use safeParse, because it has already been validated using MessageResponseSchema
    const parsedActionInput: ToolInput = ToolInputSchema.parse(
      parsedResponse.actionInput,
    );

    const toolInput = tool.inputSchema.safeParse(parsedActionInput);
    if (!toolInput.success) {
      return {
        success: false,
        data: {
          errorMessage:
            "actionInput did not match the parameter input schema of the specified tool.\n" +
            toolInput.error,
        },
      };
    }
    const parsedToolInput = toolInput.data;
    const observation: ToolResult = await tool.execute(parsedToolInput);
    return observation;
  }
}
