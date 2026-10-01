import z from "zod";
import { Chat } from "./chat.js";
import {
  type Tool,
  type ToolInput,
  type ToolResult,
  ToolInputSchema,
} from "./tools.js";

// TODO: maybe add example session to system prompt

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
      // adds system and user prompt in the first iteration
      if (i === 0) {
        this.messages.push({
          role: "system",
          content: this.getSystemPrompt(),
        });
        this.logLastMessage();

        this.messages.push({
          role: "user",
          content: prompt,
        });
        this.logLastMessage();
      }

      const response = await this.chat.sendMessage(this.messages);
      const parsedResponse: MessageResponse =
        MessageResponseSchema.parse(response);

      // adds the LLMs response to messages
      this.messages.push({
        role: "assistant",
        content: JSON.stringify(parsedResponse),
      });

      // check if final answer
      if (parsedResponse.isFinalAnswer) {
        console.log(
          "#####################################################################",
        );
        console.log("Final Answer:", parsedResponse.thought);
        console.log(
          "#####################################################################",
        );
        return;
      }

      this.logLastMessage();

      // tool execution
      const action = parsedResponse.action;
      const tool = this.tools.find((t) => t.name === action);
      if (!tool) {
        throw new Error(`Tool ${action} not found.`);
      }

      const toolInput: ToolInput = ToolInputSchema.parse(
        parsedResponse.actionInput,
      );
      const validatedToolInput = tool.inputSchema.parse(toolInput);
      const observation: ToolResult = await tool.execute(validatedToolInput);

      this.messages.push({
        role: "user",
        content: JSON.stringify(observation),
      });

      this.logLastMessage();
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
  private logLastMessage(): void {
    console.log("--------------------------------------------------");
    console.log("Added the following to messages[]:");
    console.log(this.messages[this.messages.length - 1]);
    console.log("--------------------------------------------------");
  }
}
