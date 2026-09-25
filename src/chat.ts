import OpenAI from "openai";

type Message = {
  role: "user" | "system";
  content: string;
};

export class Chat {
  private constructor() {}

  private readonly llm = new OpenAI({
    baseURL: "http://localhost:8080/v1",
    apiKey: "dummy",
  });
  private readonly messages: Message[] = [];

  static async create(systemPrompt: string): Promise<Chat> {
    const chat = new Chat();
    await chat.sendMessage(systemPrompt);
    return chat;
  }

  async sendMessage(prompt: string) {
    this.messages.push({ role: "user", content: prompt });

    const response = await this.llm.responses.create({
      model: "qwen3",
      input: this.messages,
    });

    this.messages.push({ role: "system", content: response.output_text });

    console.log(this.messages[this.messages.length - 1]);
  }
}
