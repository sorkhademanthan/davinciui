import { Section } from "@/components/component-layout";
import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  BasicCalendarDemo,
  BookedDatesDemo,
  CalendarSystemDemo,
  CellSizeDemo,
  DatePickerDemo,
  DateTimePickerDemo,
  MonthYearPickerDemo,
  PresetsDemo,
  RangeCalendarDemo,
  RtlCalendarDemo,
  TimezoneDateDemo,
  WeekNumbersDemo,
} from "@/components/docs/previews/calendar-preview";
import { Calendar } from "@workspace/ui/components/calendar";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { Calendar } from "@/components/ui/calendar"

export function Example() {
  const [date, setDate] = React.useState<Date | null>(null);

  return <Calendar selected={date} onSelect={(v) => v instanceof Date && setDate(v)} />;
}`;

const aboutNote = (
  <div className="space-y-3">
    <p className="text-sm font-semibold">About</p>
    <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
    <p>
      Calendar renders a month grid with zero date dependencies — all calendar arithmetic is derived
      from the platform Intl API, which is also what powers the Jalali and Hijri systems. Selection
      is controlled or uncontrolled, booked days are disabled via array or predicate, and every
      visual option (cell size, week numbers, time selects, direction) is a plain prop.
    </p>
    <p>
      Outside days from the neighbouring months render muted and stay selectable; picking one jumps
      the view to its month. Range mode normalises reversed picks, and time selects write straight
      into the selected date.
    </p>
    </div>
  </div>
);

const CHANGELOG: Array<{ version: string; date: string; notes: string[] }> = [
  {
    version: "1.1.0",
    date: "2026-09-04",
    notes: ["ISO week numbers", "RTL layout with locale-aware first weekday", "Persian (Jalali) and Hijri calendar systems"],
  },
  {
    version: "1.0.0",
    date: "2026-09-04",
    notes: ["Single and range selection", "Month/year dropdowns", "Time selects", "Booked (disabled) dates", "Custom cell size"],
  },
];

function AfterContent() {
  return (
    <>
      <Section title="Changelog" className="pt-8">
        <div className="space-y-4">
          {CHANGELOG.map((entry) => (
            <div key={entry.version} className="rounded-xl border bg-card p-5">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm font-semibold">v{entry.version}</span>
                <span className="font-mono text-xs text-muted-foreground">{entry.date}</span>
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
                {entry.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title="RTL Support" className="pt-8">
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-muted-foreground">
          <p>
            Pass <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">dir="rtl"</code> together
            with a right-to-left locale such as <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">ar-EG</code> or{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]">fa-IR</code>. Navigation chevrons
            mirror automatically, weekday order follows the locale&apos;s first day (Saturday for Arabic and
            Persian), and day numbers render in locale digits. Nothing else changes — selection, ranges,
            and disabled logic are direction-agnostic.
          </p>
        </div>
      </Section>
    </>
  );
}

export async function CalendarDocs() {
  const sourceCode = (await readComponentSource("calendar")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Calendar"
      description="A dependency-free date picker with single and range selection, Jalali and Hijri calendar systems, time selects, presets, booked dates, week numbers, and full RTL support."
      preview={
        <div className="flex flex-col items-center justify-center">
          <Calendar />
        </div>
      }
      previewCode={defaultCode}
      installPackageName="calendar"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/calendar.tsx"
      usageCode={defaultCode}
      usageNote={aboutNote}
      examples={[
        {
          title: "Date Picker",
          preview: <DatePickerDemo />,
          code: `import { Calendar } from "@/components/ui/calendar"

function DatePicker() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <div className="relative">
      <input
        readOnly
        value={date?.toLocaleDateString() ?? ""}
        placeholder="Pick a date"
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div className="absolute top-12 z-20">
          <Calendar
            selected={date}
            onSelect={(v) => {
              if (v instanceof Date) {
                setDate(v);
                setOpen(false);
              }
            }}
          />
        </div>
      )}
    </div>
  );
}`,
        },
        {
          title: "Persian / Hijri / Jalali Calendar",
          preview: <CalendarSystemDemo />,
          code: `import { Calendar } from "@/components/ui/calendar"

const [system, setSystem] = React.useState("persian");

<Calendar
  calendarSystem={system}
  locale={system === "persian" ? "fa-IR" : system === "islamic" ? "ar-SA" : "en-US"}
/>`,
        },
        {
          title: "Selected Date (With TimeZone)",
          preview: <TimezoneDateDemo />,
          code: `import { Calendar } from "@/components/ui/calendar"

const [date, setDate] = React.useState(new Date(2026, 7, 14, 15, 30));
const [tz, setTz] = React.useState("Asia/Dubai");

<Calendar selected={date} onSelect={(v) => v instanceof Date && setDate(v)} />
<p>
  {new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: tz,
  }).format(date)}
</p>`,
        },
        {
          title: "Basic",
          preview: <BasicCalendarDemo />,
          code: `import { Calendar } from "@/components/ui/calendar"

<Calendar defaultMonth={new Date(2026, 7, 1)} />`,
        },
        {
          title: "Range Calendar",
          preview: <RangeCalendarDemo />,
          code: `import { Calendar } from "@/components/ui/calendar"

<Calendar mode="range" />`,
        },
        {
          title: "Month and Year Selector",
          preview: <MonthYearPickerDemo />,
          code: `import { Calendar } from "@/components/ui/calendar"

<Calendar showMonthYearPicker />`,
        },
        {
          title: "Presets",
          preview: <PresetsDemo />,
          code: `import { Calendar } from "@/components/ui/calendar"

const [range, setRange] = React.useState(null);

<button onClick={() => setRange(todayRange())}>Today</button>
<button onClick={() => setRange(last7Days())}>Last 7 days</button>
<Calendar mode="range" selected={range} onSelect={setRange} />`,
        },
        {
          title: "Date and Time Picker",
          preview: <DateTimePickerDemo />,
          code: `import { Calendar } from "@/components/ui/calendar"

<Calendar showTimeSelect />`,
        },
        {
          title: "Booked dates",
          preview: <BookedDatesDemo />,
          code: `import { Calendar } from "@/components/ui/calendar"

const booked = [new Date(2026, 7, 8), new Date(2026, 7, 9)];

<Calendar disabled={booked} />`,
        },
        {
          title: "Custom Cell Size",
          preview: <CellSizeDemo />,
          code: `import { Calendar } from "@/components/ui/calendar"

<Calendar cellSize={44} />`,
        },
        {
          title: "Week Numbers",
          preview: <WeekNumbersDemo />,
          code: `import { Calendar } from "@/components/ui/calendar"

<Calendar showWeekNumbers />`,
        },
        {
          title: "RTL",
          preview: <RtlCalendarDemo />,
          code: `import { Calendar } from "@/components/ui/calendar"

<Calendar dir="rtl" locale="ar-EG" />`,
        },
      ]}
      props={[
        { name: "mode", type: '"single" | "range"', default: '"single"', description: "Selection mode." },
        { name: "selected", type: "Date | DateRange | null", default: "—", description: "Controlled selection." },
        { name: "defaultSelected", type: "Date | DateRange | null", default: "null", description: "Uncontrolled initial selection." },
        { name: "onSelect", type: "(value: Date | DateRange | null) => void", description: "Fires on every pick." },
        { name: "month", type: "Date", default: "—", description: "Controlled visible month (any date within it)." },
        { name: "defaultMonth", type: "Date", default: "today", description: "Uncontrolled initial visible month." },
        { name: "onMonthChange", type: "(month: Date) => void", description: "Fires when the visible month changes." },
        { name: "disabled", type: "Date[] | ((date: Date) => boolean)", description: "Booked days — array, predicate, or both." },
        { name: "locale", type: "string", default: '"en-US"', description: "BCP-47 locale for names and digits." },
        { name: "weekStartsOn", type: "0 | 1 | 2 | 3 | 4 | 5 | 6", default: '"0"', description: "First weekday, 0 = Sunday. Pass explicitly for locale conventions (e.g. 6 for fa-IR)." },
        { name: "showWeekNumbers", type: "boolean", default: "false", description: "ISO-8601 week column." },
        { name: "showMonthYearPicker", type: "boolean", default: "false", description: "Month + year dropdowns." },
        { name: "cellSize", type: "number", default: "36", description: "Day cell size in px." },
        { name: "showTimeSelect", type: "boolean", default: "false", description: "Hour/minute selects bound to the selection." },
        { name: "timeValue", type: "string", default: "—", description: 'Controlled "HH:MM" time.' },
        { name: "defaultTimeValue", type: "string", default: '"12:00"', description: "Uncontrolled initial time." },
        { name: "onTimeChange", type: "(value: string) => void", description: "Fires when the time selects change." },
        { name: "calendarSystem", type: '"gregory" | "persian" | "islamic"', default: '"gregory"', description: "Grid calendar system (Intl-driven)." },
        { name: "dir", type: '"ltr" | "rtl"', default: '"ltr"', description: "Text direction with mirrored navigation." },
        { name: "className", type: "string", description: "Extra classes for the root." },
      ]}
      afterContent={<AfterContent />}
    />
  );
}
