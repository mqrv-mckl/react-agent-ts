export enum ElementCategory {
  System = "SYSTEM",
  Basic = "BASIC",
  Interactive = "INTERACTIVE",
  Container = "CONTAINER",
  Chart = "CHART",
  StatusIndicator = "STATUS_INDICATOR",
}

export type ElementDefinition = {
  id: string;
  category: ElementCategory;
  description: string;
};

const element = (
  id: string,
  category: ElementCategory,
  description: string,
): ElementDefinition => ({
  id,
  category,
  description,
});

export const elements: ElementDefinition[] = [
  // System Elements
  element(
    "Current time",
    ElementCategory.System,
    "Displays the date and time in the german format",
  ),
  element(
    "Print",
    ElementCategory.System,
    "Opens the print dialog of the browser to print the current page",
  ),
  element(
    "Refresh",
    ElementCategory.System,
    "A button that makes the whole page do a refresh",
  ),

  // Basic Elements
  element("Label", ElementCategory.Basic, "Displays a custom text"),
  element("Circle", ElementCategory.Basic, "A simple circle"),
  element("Rectangle", ElementCategory.Basic, "A simple rectangle"),
  element("Line", ElementCategory.Basic, "A simple line"),
  element("Icon", ElementCategory.Basic, "A simple icon"),
  element("Image", ElementCategory.Basic, "Adds an image to the UI"),
  element("Video", ElementCategory.Basic, "Adds a video to the UI"),

  // Interactive Elements
  element(
    "Input field",
    ElementCategory.Interactive,
    "Allows the user to type some text",
  ),
  element(
    "Textarea",
    ElementCategory.Interactive,
    "Allows the user to type some text with line breaks",
  ),
  element(
    "Rich Textarea",
    ElementCategory.Interactive,
    "Allows the user to type some text with rich text formatting",
  ),
  element(
    "Button",
    ElementCategory.Interactive,
    "A normal button that can trigger several functions",
  ),
  element(
    "Calendar",
    ElementCategory.Interactive,
    "A calendar that can show custom calendar data",
  ),
  element(
    "Combobox",
    ElementCategory.Interactive,
    "A combobox that can contain custom entries",
  ),
  element(
    "Radio buttons",
    ElementCategory.Interactive,
    "A customizable radio button group",
  ),
  element(
    "List",
    ElementCategory.Interactive,
    "A normal list of custom text entries",
  ),
  element(
    "Checkbox",
    ElementCategory.Interactive,
    "A simple checkbox with a label next to it",
  ),

  // Containers
  element(
    "Absolute Layout",
    ElementCategory.Container,
    "Aligns it's children using absolute coordinates",
  ),
  element(
    "Linear Layout",
    ElementCategory.Container,
    "Aligns it's children in one line",
  ),
  element(
    "Table",
    ElementCategory.Container,
    "Aligns it's children along rows and columns",
  ),
  element(
    "Switch",
    ElementCategory.Container,
    "Allows you to always hide all children but one of them",
  ),

  // Charts
  element(
    "Bar Chart",
    ElementCategory.Chart,
    "Displays data in a diagram with horizotally aligned bars",
  ),

  // Status Indicators
  element(
    "Traffic light",
    ElementCategory.StatusIndicator,
    "Seems to be a traffic light lol",
  ),
  element("Gauge", ElementCategory.StatusIndicator, "Seems to be a gauge lol"),
];
