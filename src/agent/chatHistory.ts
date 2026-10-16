import { estimateTokenCount, isWithinTokenLimit } from "tokenx";
import z from "zod";
import type { Chat } from "./chat.js";
import {
  MessageResponseSchema,
  SummaryResponseSchema,
  type AutoSummaryOptions,
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

  /**
   * Creates a new ChatHistory instance.
   * @param {Chat} chat - The Chat instance used to summarize the chat history.
   * @param {boolean} autoSummary - True if context summarization should be triggered automatically.
   * @param {AutoSummaryOptions} autoSummaryOptions - The options for auto summary (must be provided if autoSummary=true)
   * @throws {Error} If autoSummary=true and autoSummaryOptions was not provided.
   */
  constructor(
    private readonly chat: Chat,
    private readonly autoSummary: boolean,
    private readonly autoSummaryOptions?: AutoSummaryOptions,
  ) {
    if (autoSummary && autoSummaryOptions === undefined)
      throw new Error("Auto summary needs autoSummaryOptions!");
  }

  get(): Message[] {
    return this.messages;
  }

  /**
   * Adds a new message to the chat history and logs it to the console.
   * Also handles auto summary if needed.
   * @method
   * @async
   * @param {Message} message - The message to be added to the history and logged.
   */
  async addAndLogMessage(message: Message): Promise<void> {
    this.messages.push(message);
    console.log("Added message to chat history:");
    console.log(message);

    if (this.autoSummary) await this.handleAutoSummary();
  }

  /**
   * Handles the auto summarization based on the estimated token count of the message list.
   * @method
   * @async
   */
  private async handleAutoSummary(): Promise<void> {
    // set a token limit (50% of the context length)
    const tokenLimit = Math.trunc(0.5 * this.autoSummaryOptions!.contextLength);

    // calculate the estimated token count using tokenx
    const currentMessageString = JSON.stringify(this.messages);
    const tokenEstimationOptions = {
      defaultCharsPerToken: this.autoSummaryOptions!.charactersPerToken,
    };
    const estimatedTokenCount = estimateTokenCount(
      currentMessageString,
      tokenEstimationOptions,
    );

    // log the current estimated token count
    console.log(
      `estimateTokenCount/tokenLimit: ${estimatedTokenCount}/${tokenLimit} (≈${Math.round((estimatedTokenCount / tokenLimit) * 100)}%)`,
    );

    // summarize if token limit exceeded
    if (
      !isWithinTokenLimit(
        currentMessageString,
        tokenLimit,
        tokenEstimationOptions,
      )
    ) {
      console.log("Token limit reached. Summarizing...");
      await this.summarize();
    }
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

    try {
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
    } catch (e) {
      if (e instanceof Error) {
        console.error(
          "An Error ocurred during summarization of the chat history:\n" +
            e.message,
        );
      } else {
        throw e;
      }
    }
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
    // check if the message list begins with a system prompt followed by the first user query
    const hasValidStructure =
      this.messages[0]?.role === "system" && this.messages[1]?.role === "user";
    if (!hasValidStructure)
      console.warn(
        "Invalid chat history structure. Summarization could not be performed.",
      );

    // check if the message list contains at least one final answer
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
   * @returns {Message[]} The assembled message list including the LLM's summaries.
   */
  private assembleSummarizedMessageList(
    summaryResponse: SummaryResponse,
  ): Message[] {
    // assemble the summarized message list
    const newMessageList: Message[] = [];
    newMessageList.push(this.messages[0]!); // add system prompt
    newMessageList.push({
      role: "user",
      content: "Summary: " + summaryResponse.querySummary,
    });
    newMessageList.push({
      role: "assistant",
      content: "Summary: " + summaryResponse.completedTasksSummary,
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
