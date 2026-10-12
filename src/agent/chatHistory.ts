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
    // if (...) {
    //   this.summarize();
    // }
  }

  /**
   * Summarizes the messages using the LLM.
   */
  async summarize(): Promise<void> {
    // TODO: implement
  }
}
