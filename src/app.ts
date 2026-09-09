import { elements } from "./elements.js";
import { ElementCategory, type Element } from "./elements.js";

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
  public addElement(id: string): boolean {
    const foundElement: Element | undefined = Object.values(elements).find(
      (element) => element.id === id,
    );
    if (foundElement) {
      this._elements.push(foundElement);

      // logs for demonstration purposes
      console.log("--------------------------------------------------");
      console.log(`Element added! (id: ${id})`);
      console.log("All elements that are currently inside the app: ");
      App.instance.elements.forEach((element: Element) =>
        console.log(" - ", element.id),
      );
      console.log("--------------------------------------------------");

      return true;
    }
    console.error(`Error: No element found for id '${id}'!`);
    return false;
  }
}
