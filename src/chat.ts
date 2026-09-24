import OpenAI from "openai";

type Message = {
  role: "user" | "system";
  content: string;
};

export class Chat {
  private readonly llm = new OpenAI({
    baseURL: "http://localhost:8080/v1",
    apiKey: "dummy",
  });
  private readonly messages: Message[] = [];

  async sendMessage(prompt: string) {
    this.messages.push({ role: "user", content: prompt });

    const response = await this.llm.responses.create({
      model: "qwen3",
      input: this.messages,
    });

    this.messages.push({ role: "system", content: response.output_text });

    console.log("response.output_text =", response.output_text);
  }
}
