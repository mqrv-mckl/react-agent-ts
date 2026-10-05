import z from "zod";
import { Chat } from "./chat.js";
import {
  type Tool,
  type ToolInput,
  type ToolResult,
  ToolInputSchema,
} from "./tools.js";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const MessageResponseSchema = z.object({
  thought: z.string(),
  action: z.string(),
  actionInput: ToolInputSchema,
  isFinalAnswer: z.boolean(),
});

export type MessageResponse = z.infer<typeof MessageResponseSchema>;

export class Agent {
  private readonly messages: Message[] = [];
  private readonly chat: Chat = new Chat();

  constructor(
    private readonly tools: Tool[],
    private readonly maxTurns: number,
  ) {}

  async query(prompt: string): Promise<void> {
    for (let i = 0; i < this.maxTurns; i++) {
      // add system and user prompt in the first iteration
      if (i === 0) {
        this.addAndLogMessage({
          role: "system",
          content: this.getSystemPrompt(),
        });
        this.addAndLogMessage({ role: "user", content: prompt });
      }

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

        // add the LLMs response to messages
        this.addAndLogMessage({
          role: "assistant",
          content: JSON.stringify(parsedResponse),
        });

        // check if final answer
        if (parsedResponse.isFinalAnswer) {
          console.log("Final Answer:", parsedResponse.thought);
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
                "An exception ocurred while running the tool" +
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

      if (i === this.maxTurns - 1) {
        console.warn("Turn limit reached. Stopped without a final answer.");
      }
    }
  }

  private getSystemPrompt(): string {
    // system prompt is inspired by https://github.com/mattambrogi/agent-implementation/
    return `
You run in a loop of Thought, Action, PAUSE, Observation.
At the end of the loop you output an Answer.
Use Thought to describe you thoughts about the question you have been asked.
Use Action to run one of the actions available to you.
After that you'll get the Observation, which will be the result of running those actions.

Your final answer must only contain a short summary of what you did. Put this summary into the thought-property of the returned object. Other properties like action and actionInput must stay empty in the final answer.

Your available actions are:

${this.getToolString()}

Only reply in the format shown by the JSON schema below! Just RAW JSON, no backticks (so not formatted as a codeblock), no linebreaks around it and nothing else! Just a raw string in JSON format.
${JSON.stringify(MessageResponseSchema.toJSONSchema())}
`;
  }

  private getToolString(): string {
    return this.tools
      .map((t) =>
        JSON.stringify({
          name: t.name,
          description: t.description,
          inputSchema: t.inputSchema.toJSONSchema(),
        }),
      )
      .join("\n");
  }

  // used for debugging
  private logLatestMessage(): void {
    console.log("Added the following to messages[]:");
    console.log(this.messages[this.messages.length - 1], "\n");
  }

  private addAndLogMessage(message: Message): void {
    this.messages.push({
      role: message.role,
      content: message.content,
    });
    this.logLatestMessage();
  }

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

    const actionInput = ToolInputSchema.safeParse(parsedResponse.actionInput);
    if (!actionInput.success) {
      return {
        success: false,
        data: {
          errorMessage:
            "actionInput did not match the ToolInputSchema.\n" +
            actionInput.error,
        },
      };
    }
    const parsedActionInput: ToolInput = actionInput.data;

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
