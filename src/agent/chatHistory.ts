import z from "zod";
import type { Chat } from "./chat.js";
import { MessageResponseSchema, type Message } from "./types.js";

/**
 * Represents a chat history between user and LLM.
 * @class
 */
export class ChatHistory {
  /**
   * The messages in the chat history.
   * @property {Message[]}
   */
  private messages: Message[] = [];

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
   * Only works, if there's at least one final anwer in the chat history.
   */
  async summarize(): Promise<void> {
    // check if chat history structure is invalid
    if (!this.isChatHistoryValid()) {
      console.warn(
        "Invalid chat history structure. Summarization couldn't be done.",
      );
      return;
    }

    // check if there already is a final answer
    if (this.getIndexOfLatestFinalAnwer() === -1) {
      console.warn(
        "Invalid chat history. At least one final answer is required for summarization.",
      );
      return;
    }

    // define response schema and system prompt
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

    // separate complete queries from the system prompt and a potential incomplete query
    const completeQueries = this.messages.slice(
      1,
      this.getIndexOfLatestFinalAnwer() + 1,
    );

    // assemble message for the LLM
    const summarizationInstructions: Message[] = [];
    summarizationInstructions.push({
      role: "system",
      content: summarizationSystemPrompt,
    });
    summarizationInstructions.push({
      role: "user",
      content: JSON.stringify(completeQueries),
    });

    // get summary from the LLM
    const response = await this.chat.sendMessage(
      summarizationInstructions,
      SummaryResponseSchema,
    );

    // parse to JSON
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(response);
    } catch {
      jsonResponse = undefined;
    }

    // parse response
    const parsedResponse = SummaryResponseSchema.safeParse(jsonResponse);
    if (!parsedResponse.success) {
      throw new Error(
        "Invalid response format! Details:\n" + parsedResponse.error,
      );
    }

    // assemble and assign summarized message list
    const newMessageList: Message[] = [];
    newMessageList.push(this.messages[0]!); // add system prompt
    newMessageList.push({
      role: "user",
      content: parsedResponse.data.querySummary,
    });
    newMessageList.push({
      role: "assistant",
      content: parsedResponse.data.completedTasksSummary,
    });
    // if a query without final answer exists, append the messages after the summary
    if (this.messages.length > this.getIndexOfLatestFinalAnwer() + 1) {
      newMessageList.push(
        ...this.messages.slice(this.getIndexOfLatestFinalAnwer() + 1),
      );
    }

    this.messages = newMessageList;

    console.log("----------------------------------------------");
    console.log("Chat history was summarized. Summarized version:");
    for (const m of newMessageList) console.log(m);
    console.log("----------------------------------------------");
  }

  private getIndexOfLatestFinalAnwer(): number {
    return this.messages.findLastIndex((message) => {
      if (message.content.startsWith("{")) {
        const parsedMessage = MessageResponseSchema.safeParse(
          JSON.parse(message.content),
        );
        if (parsedMessage.success) {
          return parsedMessage.data.isFinalAnswer;
        }
        return false;
      }
      return false;
    });
  }

  /**
   * Indicates whether the chat history structure is valid.
   * @method
   * @returns true, if the message list begins with a message with role="system" and another message with role="user"
   */
  private isChatHistoryValid(): boolean {
    return (
      this.messages[0]?.role === "system" && this.messages[1]?.role === "user"
    );
  }
}
