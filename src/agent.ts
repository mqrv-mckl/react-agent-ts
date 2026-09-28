import z from "zod";
import { Chat } from "./chat.js";
import type { Tool } from "./tools.js";

// TODO: add example session to system prompt

const ResponseSchema = z.object({
  thought: z.string(),
  action: z.string(),
  actionInput: z.object(),
  isFinalAnswer: z.boolean(),
});

export class Agent {
  private constructor(
    private readonly chat: Chat,
    private readonly tools: Tool<unknown, unknown>[],
    private readonly maxTurns: number,
  ) {
    this.chat = chat;
  }

  static async create(
    tools: Tool<unknown, unknown>[],
    maxTurns: number,
  ): Promise<Agent> {
    // system prompt is inspired by https://github.com/mattambrogi/agent-implementation/
    const systemPrompt = `
You run in a loop of Thought, Action, PAUSE, Observation.
At the end of the loop you output an Answer.
Use Thought to describe you throughts about the question you habe been asked.
Use Action to run one of the actions available to you – then return PAUSE.
Obervation will be the result of running those actions.

Your available actions are:

${this.getToolString(tools)}

Only reply in the format shown by the JSON schema below! Just RAW JSON, no backticks (so not formatted as a codeblock), no linebreaks around it and nothing else! Just a raw string in JSON format.
${JSON.stringify(ResponseSchema.toJSONSchema())}
`;
    const chat = await Chat.create(systemPrompt, ResponseSchema);
    return new Agent(chat, tools, maxTurns);
  }

  async query(prompt: string) {
    // for (let i = 0; i < this.maxTurns; i++) {
    this.chat.sendMessage(prompt);
    // }
  }

  static getToolString(tools: Tool<unknown, unknown>[]): string {
    const toolsArray: string[] = [];
    for (const tool of tools) {
      toolsArray.push(JSON.stringify(tool));
    }
    return toolsArray.join("");
  }
}
