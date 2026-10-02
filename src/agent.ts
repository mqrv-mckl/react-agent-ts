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

      const response = await MessageResponseSchema.safeParseAsync(
        await this.chat.sendMessage(this.messages),
      );
      let observation: ToolResult;

      if (!response.success) {
        // if response format was invalid, only add observation
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
        observation = await this.executeAction(parsedResponse);
      }

      // add observation to messages
      this.addAndLogMessage({
        role: "user",
        content: JSON.stringify(observation),
      });
    }
  }

  private getSystemPrompt(): string {
    // system prompt is inspired by https://github.com/mattambrogi/agent-implementation/
    return `
You run in a loop of Thought, Action, PAUSE, Observation.
At the end of the loop you output an Answer.
Use Thought to describe you throughts about the question you habe been asked.
Use Action to run one of the actions available to you – then return PAUSE.
Obervation will be the result of running those actions.

Your final answer must only contain a short summary of what you did. Put this summary into the thought-property of the returned object. Other properties like action and actionInput must stay empty in the final answer.

Your available actions are:

${this.getToolString(this.tools)}

Only reply in the format shown by the JSON schema below! Just RAW JSON, no backticks (so not formatted as a codeblock), no linebreaks around it and nothing else! Just a raw string in JSON format.
${JSON.stringify(MessageResponseSchema.toJSONSchema())}
`;
  }

  private getToolString(tools: Tool[]): string {
    const toolsArray: string[] = [];
    for (const tool of tools) {
      toolsArray.push(JSON.stringify(tool));
    }
    return toolsArray.join("");
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

    // TODO: change the folowing parse()-calls to safeParse()
    // and return helpful ToolResult objects in case of error

    const toolInput: ToolInput = ToolInputSchema.parse(
      parsedResponse.actionInput,
    );
    const validatedToolInput = tool.inputSchema.parse(toolInput);
    const observation: ToolResult = await tool.execute(validatedToolInput);
    return observation;
  }
}
