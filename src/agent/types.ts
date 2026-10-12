import z from "zod";

export type Tool = {
  name: string;
  description: string;
  inputSchema: object;
};

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const MessageResponseSchema = z.object({
  thought: z.string(),
  action: z.string(),
  actionInput: z.looseObject({}),
  isFinalAnswer: z.boolean(),
});

export type MessageResponse = z.infer<typeof MessageResponseSchema>;
