import OpenAI from "openai";
import z from "zod";
import { MessageResponseSchema, type Message } from "./agent.js";

export class Chat {
  private readonly llm = new OpenAI({
    baseURL: "http://localhost:8080/v1",
    apiKey: "dummy",
  });

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
    return response.choices[0]?.message.content!;
  }
}
