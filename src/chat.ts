import OpenAI from "openai";
import {
  MessageResponseSchema,
  type Message,
  type MessageResponse,
} from "./agent.js";
import z from "zod";

export class Chat {
  private readonly llm = new OpenAI({
    baseURL: "http://localhost:8080/v1",
    apiKey: "dummy",
  });

  async sendMessage(messages: Message[]): Promise<MessageResponse> {
    const response = await this.llm.chat.completions.create({
      messages: messages,
      model: "unsloth/Qwen3.8-27B-GGUF:UD-Q2_K_XL",
      reasoning_effort: "medium",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "message_response",
          strict: false,
          schema: z.toJSONSchema(MessageResponseSchema),
        },
      },
    });
    return MessageResponseSchema.parse(
      JSON.parse(response.choices[0]?.message.content!),
    );
  }
}
