import z from "zod";

export const ToolInputSchema = z.record(z.string(), z.unknown());

export type ToolInput = z.infer<typeof ToolInputSchema>;

export type Tool<InputSchema extends z.ZodObject = z.ZodObject> = {
  name: string;
  description: string;
  inputSchema: InputSchema;
  execute(input: z.infer<InputSchema>): object | Promise<object>;
};

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export const MessageResponseSchema = z.object({
  thought: z.string(),
  action: z.string(),
  actionInput: ToolInputSchema,
  isFinalAnswer: z.boolean(),
});

export type MessageResponse = z.infer<typeof MessageResponseSchema>;
