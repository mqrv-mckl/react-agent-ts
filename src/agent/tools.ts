import z from "zod";
import { App } from "../environment/app.js";
import { elements } from "../environment/elements.js";

/*
 * Another possible architecture for the tools is, to create
 * an interface 'Tool' along with specific tool implementations.
 */

export const ToolInputSchema = z.record(z.string(), z.unknown());

export type ToolInput = z.infer<typeof ToolInputSchema>;

export type Tool<InputSchema extends z.ZodObject = z.ZodObject> = {
  name: string;
  description: string;
  inputSchema: InputSchema;
  execute(input: z.infer<InputSchema>): ToolResult | Promise<ToolResult>;
};

export type ToolResult = {
  success: boolean;
  data: object;
};

// getAllElements ----------------------------------------------------------

export const GetAllElementsInputSchema = z.object({});

export const getAllElements: Tool<typeof GetAllElementsInputSchema> = {
  name: "getAllElements",
  description:
    "Returns a list of all available elements in JSON format. No input required.",
  inputSchema: GetAllElementsInputSchema,
  execute() {
    return {
      success: true,
      data: elements,
    };
  },
};

// addElementToApp ---------------------------------------------------------

export const AddElementToAppInputSchema = z.object({
  elementId: z.string().describe("The id of the element to add to the web app"),
});

export const addElementToApp: Tool<typeof AddElementToAppInputSchema> = {
  name: "addElementToApp",
  description: "Adds the element with the given elementId to the web app.",
  inputSchema: AddElementToAppInputSchema,
  execute(input) {
    const { elementId } = this.inputSchema.parse(input);
    const result: ToolResult = App.getInstance().addElement(elementId);
    return result;
  },
};
