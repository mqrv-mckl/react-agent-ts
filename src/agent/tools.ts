import z from "zod";
import { App } from "../environment/app.js";
import { elements } from "../environment/elements.js";
import type { Tool, ToolResult } from "./types.js";

/**
 * Input schema of the getAllElements tool.
 * @constant
 */
export const GetAllElementsInputSchema = z.object({});

/**
 * Tool that lets the agent retrieve all elements that can be added to the web app.
 * @constant
 */
export const getAllElements: Tool<typeof GetAllElementsInputSchema> = {
  name: "getAllElements",
  description:
    "Returns a list of all available elements including their IDs in JSON format. No input required.",
  inputSchema: GetAllElementsInputSchema,
  execute() {
    return {
      success: true,
      data: elements,
    };
  },
};

/**
 * Input schema of the addElementToApp tool.
 * @constant
 */
export const AddElementToAppInputSchema = z.object({
  elementId: z.string().describe("The ID of the element to add to the web app"),
});

/**
 * Tool that lets the agent add an element to the web app.
 * @constant
 */
export const addElementToApp: Tool<typeof AddElementToAppInputSchema> = {
  name: "addElementToApp",
  description: "Adds the element with the given elementId to the web app.",
  inputSchema: AddElementToAppInputSchema,
  execute(input) {
    const { elementId } = input;
    const result: ToolResult = App.getInstance().addElement(elementId);
    return result;
  },
};
