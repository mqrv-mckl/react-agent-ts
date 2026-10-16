import OpenAI from "openai";
import z, { ZodObject } from "zod";
import { type Message } from "./types.js";

/**
 * Represents the resoning effort levels defined by the OpenAI Chat Completions API.
 * Warning: Not every LLM supports all of them!
 */
export enum ReasoningEffort {
  None = "none",
  Low = "low",
  Medium = "medium",
  High = "high",
  XHigh = "xhigh",
  Max = "max",
}

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
   * Sends the given message list to the LLM and returns a parsed response using the specified Zod schema.
   * @method
   * @async
   * @param {Message[]} messages - The message list, including the system prompt.
   * @param {ZodObject} responseSchema - The schema describing the format in which the response is returned.
   * @param {ReasoningEffort} reasoningEffort - The reasoning effort expended to generate the response. (default=low)
   * @returns {Promise<string>} A promise that resolves with the raw content of the LLM's reply.
   * @throws {Error} If the LLM returns an empty response.
   * @throws {Error} If the LLM's response could not be parsed to JSON.
   * @throws {Error} If the LLM's response could not be parsed using the given response schema.
   */
  async getParsedResponse<S extends ZodObject>(
    messages: Message[],
    responseSchema: S,
    reasoningEffort: ReasoningEffort = ReasoningEffort.Low,
  ): Promise<z.infer<S>> {
    // generate the raw response using the llm
    const response = await this.llm.chat.completions.create({
      messages: messages,
      model: "unsloth/Qwen3.8-27B-GGUF:UD-Q2_K_XL",
      reasoning_effort: reasoningEffort,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "message_response",
          strict: false,
          schema: z.toJSONSchema(responseSchema),
        },
      },
    });

    // check if the response is empty
    const rawResponse = response.choices[0]?.message.content;
    if (!rawResponse) {
      throw new Error("The LLM returned an empty response.");
    }

    // parse the response to JSON
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(rawResponse);
    } catch (e) {
      throw new Error(
        "Error while parsing the LLM's response to JSON" +
          (e instanceof Error ? ": " + e.message : "."),
      );
    }

    // parse the response using the given response schema
    const parsedResponse = responseSchema.safeParse(jsonResponse);
    if (!parsedResponse.success) {
      throw new Error(
        "The LLM's response could not be parsed using the given response schema. Details:\n" +
          parsedResponse.error.message,
      );
    }

    return parsedResponse.data;
  }
}
