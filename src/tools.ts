import { App } from "./app.js";
import { elements } from "./elements.js";

export type Tool<TArgs, TResult> = {
  name: string;
  description: string;
  argumentDescription: string;
  returnDescription: string;
  execute(args: TArgs): TResult | Promise<TResult>;
};

export const getAllElements: Tool<{}, string> = {
  name: "getAllElements",
  description: "Returns a list of all available elements in JSON format.",
  argumentDescription: "no arguments",
  returnDescription:
    "string – the list of all available elements in JSON format",
  execute() {
    return JSON.stringify(elements);
  },
};

export const addElementToApp: Tool<string, boolean> = {
  name: "addElementToApp",
  description:
    "Adds the element with the given id to a web app. Returns true, if it was successful",
  argumentDescription: "id: string – id of the element to add",
  returnDescription: "boolean – true if the element was added successfully",
  execute(id) {
    return App.getInstance().addElement(id);
  },
};
