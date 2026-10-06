// describes all existing categories of elements
export enum ElementCategory {
  System = "SYSTEM",
  Basic = "BASIC",
  Interactive = "INTERACTIVE",
  Container = "CONTAINER",
  Chart = "CHART",
}

export type Element = {
  id: string;
  name: string;
  category: ElementCategory;
  description: string;
};

const element = (
  id: string,
  name: string,
  category: ElementCategory,
  description: string,
): Element => ({
  id,
  name,
  category,
  description,
});

// a collection of all elements
export const elements = {
  // System Elements
  current_time: element(
    "current_time",
    "Current time",
    ElementCategory.System,
    "Displays the date and time in the German format",
  ),
  print: element(
    "print",
    "Print",
    ElementCategory.System,
    "Opens the print dialog of the browser to print the current page",
  ),
  refresh: element(
    "refresh",
    "Refresh",
    ElementCategory.System,
    "A button that makes the whole page do a refresh",
  ),

  // Basic Elements
  label: element(
    "label",
    "Label",
    ElementCategory.Basic,
    "Displays a custom text",
  ),
  circle: element("circle", "Circle", ElementCategory.Basic, "A simple circle"),
  rectangle: element(
    "rectangle",
    "Rectangle",
    ElementCategory.Basic,
    "A simple rectangle",
  ),
  line: element("line", "Line", ElementCategory.Basic, "A simple line"),
  icon: element("icon", "Icon", ElementCategory.Basic, "A simple icon"),
  image: element(
    "image",
    "Image",
    ElementCategory.Basic,
    "Adds an image to the UI",
  ),
  video: element(
    "video",
    "Video",
    ElementCategory.Basic,
    "Adds a video to the UI",
  ),

  // Interactive Elements
  input_field: element(
    "imput_field",
    "Input field",
    ElementCategory.Interactive,
    "Allows the user to type some text",
  ),
  textarea: element(
    "textarea",
    "Textarea",
    ElementCategory.Interactive,
    "Allows the user to type some text with line breaks",
  ),
  rich_textarea: element(
    "rich_textarea",
    "Rich Textarea",
    ElementCategory.Interactive,
    "Allows the user to type some text with rich text formatting",
  ),
  button: element(
    "button",
    "Button",
    ElementCategory.Interactive,
    "A normal button that can trigger several functions",
  ),
  calendar: element(
    "calendar",
    "Calendar",
    ElementCategory.Interactive,
    "A calendar that can show custom calendar data",
  ),
  combobox: element(
    "combobox",
    "Combobox",
    ElementCategory.Interactive,
    "A combobox that can contain custom entries",
  ),
  radio_buttons: element(
    "radio_buttons",
    "Radio buttons",
    ElementCategory.Interactive,
    "A customizable radio button group",
  ),
  list: element(
    "list",
    "List",
    ElementCategory.Interactive,
    "A normal list of custom text entries",
  ),
  checkbox: element(
    "checkbox",
    "Checkbox",
    ElementCategory.Interactive,
    "A simple checkbox with a label next to it",
  ),

  // Containers
  absolute_layout: element(
    "absolute_layout",
    "Absolute Layout",
    ElementCategory.Container,
    "Aligns its children using absolute coordinates",
  ),
  linear_layout: element(
    "linear_layout",
    "Linear Layout",
    ElementCategory.Container,
    "Aligns its children in one line",
  ),
  table: element(
    "table",
    "Table",
    ElementCategory.Container,
    "Aligns its children along rows and columns",
  ),

  // Charts
  bar_chart: element(
    "bar_chart",
    "Bar Chart",
    ElementCategory.Chart,
    "Displays data in a diagram with horizontally aligned bars",
  ),
} satisfies Record<string, Element>;
