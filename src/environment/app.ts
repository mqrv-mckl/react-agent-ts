import type { ToolResult } from "../agent/types.js";
import { ElementCategory, elements, type Element } from "./elements.js";

export class App {
  private static instance: App;
  private constructor() {}

  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  _layout: Element = elements.absolute_layout;
  _elements: Element[] = [];

  get layout(): Element {
    return this._layout;
  }

  set layout(newLayout: Element) {
    if (newLayout.category === ElementCategory.Container)
      this._layout = newLayout;
    else console.error(`Error: '${newLayout}' is not a valid layout element!`);
  }

  get elements(): Element[] {
    return this._elements;
  }

  /**
   * Adds an element to the app and places it inside of the layout.
   */
  public addElement(id: string): ToolResult {
    const foundElement: Element | undefined = Object.values(elements).find(
      (element) => element.id === id,
    );
    if (foundElement) {
      this._elements.push(foundElement);

      return {
        success: true,
        data: {
          info: `Element with id '${id}' added! All elements that are currently inside the app: ${App.instance.elements.map((e) => e.id).join(", ")}`,
        },
      };
    }
    return {
      success: false,
      data: {
        errorMessage: `No element found for id '${id}'! Make sure to use the id property of the specified element.`,
      },
    };
  }
}
