import type { ToolResult } from "../agent/types.js";
import { ElementCategory, elements, type Element } from "./elements.js";

/**
 * Represents a minimal web app builder that uses the Singleton pattern.
 * @class
 */
export class App {
  /**
   * The web app instance
   */
  private static instance: App;

  /**
   * Creates a new App instance.
   */
  private constructor() {}

  /**
   * Provides the web app instance.
   */
  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  /**
   * The current layout of the web app.
   */
  private _layout: Element = elements.absolute_layout;

  /**
   * The elements that are currently inside the app.
   */
  private _elements: Element[] = [];

  /**
   * Returns the current layout of the web app.
   */
  get layout(): Element {
    return this._layout;
  }

  /**
   * Sets the layout of the web app. Only accepts elements with element.category === ElementCategory.Container.
   */
  set layout(newLayout: Element) {
    if (newLayout.category === ElementCategory.Container)
      this._layout = newLayout;
    else console.error(`Error: '${newLayout}' is not a valid layout element!`);
  }

  /**
   * Returns the elements that are currently inside the app.
   */
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
