import z from "zod";
import type { Chat } from "./chat.js";
import {
  MessageResponseSchema,
  SummaryResponseSchema,
  type Message,
  type SummaryResponse,
} from "./types.js";

/**
 * Represents a chat history between the user and the LLM.
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
     * True if context summarization should be triggered automatically.
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
   * Only works, if there's at least one final answer in the chat history.
   * @method
   * @async
   */
  async summarize(): Promise<void> {
    // check if summarization is possible
    if (!this.isSummarizationPossible()) return;

    // get summary from the LLM
    const response: SummaryResponse = await this.chat.getParsedResponse(
      this.getSummarizationInstructions(),
      SummaryResponseSchema,
    );

    // assign summarized message list
    this.messages = this.assembleSummarizedMessageList(response);

    // log to console
    console.log("----------------------------------------------");
    console.log("Chat history was summarized. Summarized version:");
    for (const m of this.messages) console.log(m);
    console.log("----------------------------------------------");
  }

  /**
   * Finds the index of the latest final answer in a message list.
   * A final answer is an object of type MessageResponse (inside the content property of a Message object) whose isFinalAnswer property has the value true.
   * @method
   * @returns {number} The index of the latest final answer inside the current message list (or -1 if there currently is no final answer).
   */
  private getIndexOfLatestFinalAnswer(): number {
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
   * Indicates whether the chat history can be summarized.
   * @method
   * @returns {boolean} True if the message list begins with a message with role="system" and another message with role="user" and contains at least one final answer.
   */
  private isSummarizationPossible(): boolean {
    const hasValidStructure =
      this.messages[0]?.role === "system" && this.messages[1]?.role === "user";
    if (!hasValidStructure)
      console.warn(
        "Invalid chat history structure. Summarization could not be performed.",
      );

    const containsFinalAnswer = this.getIndexOfLatestFinalAnswer() !== -1;
    if (!containsFinalAnswer)
      console.log(
        "Invalid chat history. At least one final answer is required for summarization.",
      );

    return hasValidStructure && containsFinalAnswer;
  }

  /**
   * Assembles the instructions that tell the LLM what should be summarized and in what format.
   * @method
   * @returns {Message[]} The message list that can be given to the LLM.
   */
  private getSummarizationInstructions(): Message[] {
    // define the system prompt
    const summarizationSystemPrompt = `Your task is to summarize chat histories between the user and the assistant. These consist of alternating messages between the user and the assistant. All messages from the user that consist of a simple string are queries. All others are observations (e.g., results from a tool that was run). Once the assistant has completed the task specified in a query sent by the user, it sends a response in which isFinalAnswer is set to true and the thought field contains a brief summary of the completed tasks.
You should now summarize and output the information in the following format:
${JSON.stringify(z.toJSONSchema(SummaryResponseSchema))}`;

    // separate complete queries from the system prompt and a potentially incomplete query
    const completeQueries = this.messages.slice(
      1,
      this.getIndexOfLatestFinalAnswer() + 1,
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

    return summarizationInstructions;
  }

  /**
   * Assembles the summarized message list using the summary generated by the LLM.
   * @method
   * @param {SummaryResponse} summaryResponse - The summary generated by the LLM.
   * @returns The assembled message list including the LLM's summaries.
   */
  private assembleSummarizedMessageList(
    summaryResponse: SummaryResponse,
  ): Message[] {
    // assemble the summarized message list
    const newMessageList: Message[] = [];
    newMessageList.push(this.messages[0]!); // add system prompt
    newMessageList.push({
      role: "user",
      content: summaryResponse.querySummary,
    });
    newMessageList.push({
      role: "assistant",
      content: summaryResponse.completedTasksSummary,
    });
    // if a query without a final answer exists, append the messages after the summary
    if (this.messages.length > this.getIndexOfLatestFinalAnswer() + 1) {
      newMessageList.push(
        ...this.messages.slice(this.getIndexOfLatestFinalAnswer() + 1),
      );
    }

    return newMessageList;
  }
}
