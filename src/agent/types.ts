import z from "zod";

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

export const SummaryResponseSchema = z.object({
  querySummary: z.string().describe("A summary of all the user queries."),
  completedTasksSummary: z
    .string()
    .describe(
      "A summary of all the things the assistant did to complete its tasks.",
    ),
});

export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;

export type Observation = {
  success: boolean;
  data: object;
};
