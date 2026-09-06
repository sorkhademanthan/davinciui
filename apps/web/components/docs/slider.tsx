import { DocsPageLayout } from "@/components/docs-page-layout";
import {
  ControlledSliderDemo,
  DisabledSliderDemo,
  MultipleThumbsDemo,
  RangeSliderDemo,
  RtlSliderDemo,
  VerticalSliderDemo,
} from "@/components/docs/previews/slider-preview";
import { Slider } from "@workspace/ui/components/slider";
import { readComponentSource } from "@/lib/source-code";

const defaultCode = `import { Slider } from "@/components/ui/slider"

export function Example() {
  const [value, setValue] = React.useState(50);

  return <Slider value={value} onValueChange={setValue} />;
}`;

export async function SliderDocs() {
  const sourceCode =
    (await readComponentSource("slider")) || "// Unable to load source code";

  return (
    <DocsPageLayout
      title="Slider"
      description="Pointer and keyboard multi-thumb slider with range fill, vertical layout, controlled values, and RTL mirroring."
      preview={
        <div className="flex flex-col items-center justify-center">
          <div className="w-64">
            <Slider defaultValue={50} />
          </div>
        </div>
      }
      previewCode={defaultCode}
      installPackageName="slider"
      installSourceCode={sourceCode}
      installSourceFilename="components/ui/slider.tsx"
      usageCode={defaultCode}
      examples={[
        {
          title: "Range",
          preview: <RangeSliderDemo />,
          code: `import { Slider } from "@/components/ui/slider"

const [range, setRange] = React.useState([25, 75]);

<Slider value={range} onValueChange={setRange} />`,
        },
        {
          title: "Multiple Thumbs",
          preview: <MultipleThumbsDemo />,
          code: `import { Slider } from "@/components/ui/slider"

// Any number of thumbs — drag or Tab + arrows per thumb.
<Slider
  value={[10, 50, 90]}
  onValueChange={setValue}
  ariaLabel={["Low", "Mid", "High"]}
/>`,
        },
        {
          title: "Vertical",
          preview: <VerticalSliderDemo />,
          code: `import { Slider } from "@/components/ui/slider"

<Slider orientation="vertical" />`,
        },
        {
          title: "Controlled",
          preview: <ControlledSliderDemo />,
          code: `import { Slider } from "@/components/ui/slider"

const [value, setValue] = React.useState(30);

<Slider value={value} onValueChange={setValue} />
<button onClick={() => setValue(30)}>Reset</button>`,
        },
        {
          title: "Disabled",
          preview: <DisabledSliderDemo />,
          code: `import { Slider } from "@/components/ui/slider"

<Slider defaultValue={40} disabled />`,
        },
        {
          title: "RTL",
          preview: <RtlSliderDemo />,
          code: `import { Slider } from "@/components/ui/slider";

<div dir="rtl">
  <Slider dir="rtl" />
</div>`,
        },
      ]}
      props={[
        { name: "value", type: "number | number[]", default: "—", description: "Controlled value; array enables multiple thumbs." },
        { name: "defaultValue", type: "number | number[]", default: "50", description: "Uncontrolled initial value." },
        { name: "onValueChange", type: "(value: number | number[]) => void", description: "Fires with the snapped value on every change." },
        { name: "min", type: "number", default: "0", description: "Minimum." },
        { name: "max", type: "number", default: "100", description: "Maximum." },
        { name: "step", type: "number", default: "1", description: "Step snapping." },
        { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Track direction." },
        { name: "disabled", type: "boolean", default: "false", description: "Disable all interaction." },
        { name: "ariaLabel", type: "string | string[]", default: '"Value"', description: "Accessible label, one per thumb." },
        { name: "dir", type: '"ltr" | "rtl"', default: '"ltr"', description: "Mirrors horizontal fill, thumbs, and arrows." },
        { name: "className", type: "string", description: "Extra classes for the root." },
      ]}
    />
  );
}
