import z from "zod";
import { App } from "../environment/app.js";
import { elements } from "../environment/elements.js";
import type { Tool, ToolResult } from "./types.js";

// getAllElements ----------------------------------------------------------

export const GetAllElementsInputSchema = z.object({});

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

// addElementToApp ---------------------------------------------------------

export const AddElementToAppInputSchema = z.object({
  elementId: z.string().describe("The id of the element to add to the web app"),
});

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
