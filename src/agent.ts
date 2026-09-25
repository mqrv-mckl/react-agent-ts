import { Chat } from "./chat.js";
import type { Tool } from "./tools.js";

// TODO: add example session to system prompt

type AgentStep = {
  thought: string;
  action: string;
  actionInput: string;
  observation: string;
};

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
    // system prompt is from https://github.com/mattambrogi/agent-implementation/
    const systemPrompt = `
You run in a loop of Thought, Action, PAUSE, Observation.
At the end of the loop you output an Answer.
Use Thought to describe you throughts about the question you habe been asked.
Use Action to run one of the actions available to you – then return PAUSE.
Obervation will be the result of running those actions.

Your available actions are:

${this.getToolString(tools)}
`;
    const chat = await Chat.create(systemPrompt);
    return new Agent(chat, tools, maxTurns);
  }

  async query(prompt: string) {
    for (let i = 0; i < this.maxTurns; i++) {
      // TODO: implement ReAct loop
    }
  }

  static getToolString(tools: Tool<unknown, unknown>[]): string {
    const toolsArray: string[] = [];
    for (const tool in tools) {
      toolsArray.push(JSON.stringify(tool));
    }
    return toolsArray.join("");
  }
}
