import z from "zod";
import type { Chat } from "./chat.js";
import type { Message } from "./types.js";

/**
 * Represents a chat history between user and LLM.
 * @class
 */
export class ChatHistory {
  /**
   * The messages in the chat history.
   * @property {Message[]}
   */
  private readonly messages: Message[] = [];

  constructor(
    /**
     * The context length in tokens.
     * @property {number}
     */
    private readonly contextLength: number,

    /**
     * True, if context summarizations should be triggered automatically.
     * @property {boolean}
     */
    private readonly autoSummary: boolean,

    /**
     * The Chat instance used to summarize the chat history.
     */
    private readonly chat: Chat,
  ) {}

  get(): Message[] {
    return this.messages;
  }

  /**
   * Adds a new message to the chat history and logs it to the console.
   * @method
   * @param {Message} message - The message to be added to the history and logged.
   */
  addAndLogMessage(message: Message): void {
    this.messages.push(message);
    console.log("Added message to chat history:");
    console.log(message);

    // TODO: implement, when summarize method is implemented
    // if (... && autoSummary) {
    //   this.summarize();
    // }
  }

  /**
   * Summarizes the messages using the LLM.
   */
  async summarize(): Promise<void> {
    const SummaryResponseSchema = z.object({
      querySummary: z.string().describe("A summary of all the user queries."),
      completedTasksSummary: z
        .string()
        .describe(
          "A summary of all the things the assistant did to complete its tasks.",
        ),
    });
    const summarizationSystemPrompt = `
Your task is to summarize chat histories between the user and the assistant. These consist of alternating messages between the user and the assistant. All messages from the user that consist of a simple string are queries. All others are observations (e.g., results from a tool that was run). Once the Assistant has completed the task specified in a query sent by the user, it sends a response in which isFinalAnswer is set to true and the thought field contains a brief summary of the completed tasks.
You should now summarize and output the information in the following format:
${JSON.stringify(z.toJSONSchema(SummaryResponseSchema))}
`;
  }
}
