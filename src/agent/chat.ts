import OpenAI from "openai";
import z from "zod";
import { MessageResponseSchema, type Message } from "./types.js";

/**
 * Represents an interface to interact with an LLM through an OpenAI-compatible API.
 * Responses are requested in the JSON format of MessageResponseSchema.
 * @class
 */
export class Chat {
  /**
   * The OpenAI client used to send requests to the LLM.
   * @property {OpenAI}
   */
  private readonly llm: OpenAI;

  /**
   * Creates a new Chat instance.
   * @constructor
   * @param {string} baseURL - The base URL of the OpenAI-compatible API.
   * @param {string} apiKey - The API key used to authenticate with the API. Local servers often accept any placeholder value.
   * @example
   * const chat = new Chat("http://localhost:8080/v1", "dummy");
   */
  constructor(baseURL: string, apiKey: string) {
    this.llm = new OpenAI({
      baseURL: baseURL,
      apiKey: apiKey,
    });
  }

  /**
   * Sends the message history to the LLM and returns its reply.
   * The reply is requested as JSON matching MessageResponseSchema, but the schema is not enforced strictly, so the returned string still has to be parsed and validated by the caller.
   * @method
   * @async
   * @param {Message[]} messages - The message history, including the system prompt.
   * @returns {Promise<string>} A promise that resolves with the raw content of the LLM's reply.
   * @throws {Error} If the LLM returns an empty response.
   */
  async sendMessage(messages: Message[]): Promise<string> {
    const response = await this.llm.chat.completions.create({
      messages: messages,
      model: "unsloth/Qwen3.8-27B-GGUF:UD-Q2_K_XL",
      reasoning_effort: "low",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "message_response",
          strict: false,
          schema: z.toJSONSchema(MessageResponseSchema),
        },
      },
    });
    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("The LLM returned an empty response.");
    }
    return content;
  }
}
