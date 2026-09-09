import { tool } from "@openai/agents";
import { z } from "zod";
import { App } from "./app.js";

export const add_element_to_app = tool({
  name: "add_element_to_app",
  description: "Adds the element with the given id to a web app",
  parameters: z.object({ id: z.string() }),
  async execute({ id }) {
    if (App.getInstance().addElement(id)) return "Element has been added.";
    else return "Element couldn't be added. See console for more information.";
  },
});
