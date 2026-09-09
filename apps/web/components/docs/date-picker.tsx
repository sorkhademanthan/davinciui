import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  BasicDatePickerDemo,
  ClearDatePickerDemo,
  DisabledDatesPickerDemo,
  PlacementDatePickerDemo,
  PresetsDatePickerDemo,
  RtlDatePickerDemo,
  TimeDatePickerDemo,
} from "@/components/docs/previews/date-picker-preview";
import { DatePicker } from "@workspace/ui/components/date-picker";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { DatePicker } from "@/components/ui/date-picker"

export function Example() {
  const [date, setDate] = React.useState<Date | null>(null);

  return <DatePicker value={date} onValueChange={setDate} />;
`;

export async function DatePickerDocs() {
  const sourceCode =
    (await readComponentSource("date-picker")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Date Picker"
      description="An input-anchored single-date picker with presets, time selects, booked dates, popup placement, and RTL — built on Calendar, dependency-free."
      preview={
        <div className="flex flex-col items-center justify-center">
          <DatePicker />
        </div>
      }
      previewCode={defaultCode}
      installPackageName="date-picker"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/date-picker.tsx"
      usageCode={defaultCode}
      examples={[
        {
          title: "Basic",
          preview: <BasicDatePickerDemo />,
          code: `import { DatePicker } from "@/components/ui/date-picker"

const [date, setDate] = React.useState<Date | null>(null);

<DatePicker value={date} onValueChange={setDate} />`,
        },
        {
          title: "With Presets",
          preview: <PresetsDatePickerDemo />,
          code: `import { DatePicker } from "@/components/ui/date-picker"

<DatePicker
  presets={[
    { label: "Today", value: () => new Date() },
    { label: "Tomorrow", value: () => addDays(new Date(), 1) },
  ]}
/>`,
        },
        {
          title: "With Time",
          preview: <TimeDatePickerDemo />,
          code: `import { DatePicker } from "@/components/ui/date-picker"

<DatePicker showTimeSelect />`,
        },
        {
          title: "Clear Button",
          preview: <ClearDatePickerDemo />,
          code: `import { DatePicker } from "@/components/ui/date-picker"

<DatePicker showClearButton />`,
        },
        {
          title: "Disabled Dates",
          preview: <DisabledDatesPickerDemo />,
          code: `import { DatePicker } from "@/components/ui/date-picker"

const booked = [new Date(2026, 7, 8), new Date(2026, 7, 9)];

<DatePicker disabledDates={booked} />`,
        },
        {
          title: "Placement",
          preview: <PlacementDatePickerDemo />,
          code: `import { DatePicker } from "@/components/ui/date-picker"

<DatePicker placement="top-end" />`,
        },
        {
          title: "RTL",
          preview: <RtlDatePickerDemo />,
          code: `import { DatePicker } from "@/components/ui/date-picker"

<DatePicker dir="rtl" locale="ar-EG" weekStartsOn={6} />`,
        },
      ]}
      props={[
        { name: "value", type: "Date | null", default: "—", description: "Controlled selected date." },
        { name: "defaultValue", type: "Date | null", default: "null", description: "Uncontrolled initial date." },
        { name: "onValueChange", type: "(date: Date | null) => void", description: "Fires on pick, preset, clear, and time edits." },
        { name: "placeholder", type: "string", default: '"Pick a date"', description: "Input placeholder." },
        { name: "disabled", type: "boolean", default: "false", description: "Disable the whole control." },
        { name: "invalid", type: "boolean", default: "false", description: "Error state with aria-invalid." },
        { name: "showClearButton", type: "boolean", default: "false", description: "Inline X that clears the date." },
        { name: "showTimeSelect", type: "boolean", default: "false", description: "Hour/minute selects bound to the value." },
        { name: "presets", type: "DatePickerPreset[]", description: "Quick-pick buttons; values can be Dates or factories." },
        { name: "disabledDates", type: "Date[] | ((date: Date) => boolean)", description: "Booked days — array, predicate, or both." },
        { name: "formatDate", type: "(date: Date) => string", description: "Display formatter for the input." },
        { name: "locale", type: "string", default: '"en-US"', description: "BCP-47 locale for calendar and readout." },
        { name: "weekStartsOn", type: "0 | 1 | 2 | 3 | 4 | 5 | 6", default: '"0"', description: "First weekday, 0 = Sunday." },
        { name: "calendarSystem", type: '"gregory" | "persian" | "islamic"', default: '"gregory"', description: "Grid calendar system." },
        { name: "dir", type: '"ltr" | "rtl"', default: '"ltr"', description: "Text direction." },
        { name: "placement", type: '"bottom-start" | "bottom-end" | "top-start" | "top-end"', default: '"bottom-start"', description: "Preferred popup alignment; flips to stay in viewport." },
        { name: "open", type: "boolean", default: "—", description: "Controlled popup state." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Uncontrolled initial popup state." },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Fires when the popup opens or closes." },
        { name: "className", type: "string", description: "Extra classes for the root." },
        { name: "inputClassName", type: "string", description: "Extra classes for the text input." },
        { name: "calendarClassName", type: "string", description: "Extra classes for the inner calendar." },
      ]}
    />
  );
}
