export enum ElementCategory {
  System = "SYSTEM",
  Basic = "BASIC",
  Interactive = "INTERACTIVE",
  Container = "CONTAINER",
  Chart = "CHART",
  StatusIndicator = "STATUS_INDICATOR",
}

export type Element = {
  id: string;
  category: ElementCategory;
  description: string;
};

const element = (
  id: string,
  category: ElementCategory,
  description: string,
): Element => ({
  id,
  category,
  description,
});

export const elements = {
  // System Elements
  current_time: element(
    "Current time",
    ElementCategory.System,
    "Displays the date and time in the german format",
  ),
  print: element(
    "Print",
    ElementCategory.System,
    "Opens the print dialog of the browser to print the current page",
  ),
  refresh: element(
    "Refresh",
    ElementCategory.System,
    "A button that makes the whole page do a refresh",
  ),

  // Basic Elements
  label: element("Label", ElementCategory.Basic, "Displays a custom text"),
  circle: element("Circle", ElementCategory.Basic, "A simple circle"),
  rectangle: element("Rectangle", ElementCategory.Basic, "A simple rectangle"),
  line: element("Line", ElementCategory.Basic, "A simple line"),
  icon: element("Icon", ElementCategory.Basic, "A simple icon"),
  image: element("Image", ElementCategory.Basic, "Adds an image to the UI"),
  video: element("Video", ElementCategory.Basic, "Adds a video to the UI"),

  // Interactive Elements
  input_field: element(
    "Input field",
    ElementCategory.Interactive,
    "Allows the user to type some text",
  ),
  textarea: element(
    "Textarea",
    ElementCategory.Interactive,
    "Allows the user to type some text with line breaks",
  ),
  rich_textarea: element(
    "Rich Textarea",
    ElementCategory.Interactive,
    "Allows the user to type some text with rich text formatting",
  ),
  button: element(
    "Button",
    ElementCategory.Interactive,
    "A normal button that can trigger several functions",
  ),
  calendar: element(
    "Calendar",
    ElementCategory.Interactive,
    "A calendar that can show custom calendar data",
  ),
  combobox: element(
    "Combobox",
    ElementCategory.Interactive,
    "A combobox that can contain custom entries",
  ),
  radio_buttons: element(
    "Radio buttons",
    ElementCategory.Interactive,
    "A customizable radio button group",
  ),
  list: element(
    "List",
    ElementCategory.Interactive,
    "A normal list of custom text entries",
  ),
  checkbox: element(
    "Checkbox",
    ElementCategory.Interactive,
    "A simple checkbox with a label next to it",
  ),

  // Containers
  absolute_layout: element(
    "Absolute Layout",
    ElementCategory.Container,
    "Aligns it's children using absolute coordinates",
  ),
  linear_layout: element(
    "Linear Layout",
    ElementCategory.Container,
    "Aligns it's children in one line",
  ),
  table: element(
    "Table",
    ElementCategory.Container,
    "Aligns it's children along rows and columns",
  ),
  swtich: element(
    "Switch",
    ElementCategory.Container,
    "Allows you to always hide all children but one of them",
  ),

  // Charts
  bar_chart: element(
    "Bar Chart",
    ElementCategory.Chart,
    "Displays data in a diagram with horizotally aligned bars",
  ),

  // Status Indicators
  traffic_light: element(
    "Traffic light",
    ElementCategory.StatusIndicator,
    "Seems to be a traffic light lol",
  ),
  gauge: element(
    "Gauge",
    ElementCategory.StatusIndicator,
    "Seems to be a gauge lol",
  ),
};
