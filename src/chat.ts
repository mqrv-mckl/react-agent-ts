import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.js";
import type { ZodObject } from "zod";

type Message = {
  role: "user" | "system";
  content: string;
};

export class Chat {
  private constructor(private readonly responseSchema: ZodObject) {}

  private readonly llm = new OpenAI({
    baseURL: "http://localhost:8080/v1",
    apiKey: "dummy",
  });
  private readonly messages: Message[] = [];

  static async create(
    systemPrompt: string,
    responseSchema: ZodObject,
  ): Promise<Chat> {
    const chat = new Chat(responseSchema);
    await chat.sendMessage(systemPrompt);
    return chat;
  }

  async sendMessage(prompt: string) {
    this.messages.push({ role: "user", content: prompt });
    this.printLastMessage();

    const response = await this.llm.chat.completions.create({
      messages: this.messages,
      model: "gemma3",
      response_format: zodResponseFormat(this.responseSchema, "response"),
    });

    this.messages.push({
      role: "system",
      content: response.choices[0]?.message.content!,
    });
    this.printLastMessage();
  }

  private printLastMessage(): void {
    console.log(this.messages[this.messages.length - 1]);
  }
}
